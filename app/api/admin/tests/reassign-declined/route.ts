import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'admin@hitlai.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { testRequestId } = await request.json()

    if (!testRequestId) {
      return NextResponse.json({ error: 'Test request ID required' }, { status: 400 })
    }

    // Get test request details
    const { data: testRequest, error: testError } = await supabase
      .from('test_requests')
      .select('*')
      .eq('id', testRequestId)
      .single()

    if (testError || !testRequest) {
      return NextResponse.json({ error: 'Test request not found' }, { status: 404 })
    }

    // Get declined assignments
    const { data: declinedAssignments, error: declinedError } = await supabase
      .from('test_assignments')
      .select('*')
      .eq('test_request_id', testRequestId)
      .eq('status', 'declined')

    if (declinedError) throw declinedError

    if (!declinedAssignments || declinedAssignments.length === 0) {
      return NextResponse.json({ message: 'No declined assignments to replace' })
    }

    const replacements = []

    // For each declined assignment, find a replacement
    for (const declined of declinedAssignments) {
      if (declined.tester_type === 'human') {
        // Find replacement human tester
        const { data: availableTesters } = await supabase
          .from('human_testers')
          .select('*')
          .eq('is_available', true)
          .eq('is_verified', true)
          .not('id', 'in', `(${declinedAssignments.filter(d => d.tester_id).map(d => d.tester_id).join(',')})`)
          .limit(5)

        if (availableTesters && availableTesters.length > 0) {
          // Score testers based on test requirements
          const scoredTesters = availableTesters.map(tester => {
            let score = 0
            
            // Match preferred test types
            if (testRequest.test_type && tester.preferred_test_types?.includes(testRequest.test_type)) {
              score += 10
            }
            
            // Match tech literacy
            if (testRequest.personas && tester.tech_literacy) {
              score += 5
            }
            
            return { tester, score }
          })

          // Sort by score and pick the best
          scoredTesters.sort((a, b) => b.score - a.score)
          const bestTester = scoredTesters[0].tester

          // Create new assignment
          const { data: newAssignment, error: assignError } = await supabase
            .from('test_assignments')
            .insert({
              test_request_id: testRequestId,
              tester_id: bestTester.id,
              tester_type: 'human',
              status: 'assigned'
            })
            .select()
            .single()

          if (!assignError && newAssignment) {
            replacements.push({
              type: 'human',
              tester_name: bestTester.display_name,
              assignment_id: newAssignment.id
            })

            // Create notification for new tester
            await supabase.rpc('create_notification', {
              p_user_id: bestTester.user_id,
              p_user_type: 'tester',
              p_type: 'test_assigned',
              p_title: 'New Test Assignment',
              p_message: `You have been assigned to test: ${testRequest.title}`,
              p_link: `/tester/tests/${testRequestId}`,
              p_metadata: { test_request_id: testRequestId, assignment_id: newAssignment.id }
            })
          }
        } else {
          // No human testers available, suggest AI instead
          const { data: aiPersonas } = await supabase
            .from('personas')
            .select('*')
            .limit(1)

          if (aiPersonas && aiPersonas.length > 0) {
            const aiPersona = aiPersonas[0]

            const { data: newAssignment, error: assignError } = await supabase
              .from('test_assignments')
              .insert({
                test_request_id: testRequestId,
                ai_persona_id: aiPersona.id,
                tester_type: 'ai',
                status: 'assigned'
              })
              .select()
              .single()

            if (!assignError && newAssignment) {
              replacements.push({
                type: 'ai',
                tester_name: aiPersona.name,
                assignment_id: newAssignment.id,
                fallback: true
              })
            }
          }
        }
      } else {
        // Replace AI with another AI persona
        const { data: aiPersonas } = await supabase
          .from('personas')
          .select('*')
          .not('id', 'eq', declined.ai_persona_id)
          .limit(1)

        if (aiPersonas && aiPersonas.length > 0) {
          const aiPersona = aiPersonas[0]

          const { data: newAssignment } = await supabase
            .from('test_assignments')
            .insert({
              test_request_id: testRequestId,
              ai_persona_id: aiPersona.id,
              tester_type: 'ai',
              status: 'assigned'
            })
            .select()
            .single()

          if (newAssignment) {
            replacements.push({
              type: 'ai',
              tester_name: aiPersona.name,
              assignment_id: newAssignment.id
            })
          }
        }
      }
    }

    // Notify company about replacements
    const { data: companyMember } = await supabase
      .from('company_members')
      .select('user_id')
      .eq('company_id', testRequest.company_id)
      .single()

    if (companyMember) {
      await supabase.rpc('create_notification', {
        p_user_id: companyMember.user_id,
        p_user_type: 'company',
        p_type: 'system_message',
        p_title: 'Testers Reassigned',
        p_message: `${replacements.length} replacement tester(s) have been assigned to your test: ${testRequest.title}`,
        p_link: `/company/tests/${testRequestId}`,
        p_metadata: { test_request_id: testRequestId, replacements: replacements.length }
      })
    }

    return NextResponse.json({
      success: true,
      declined_count: declinedAssignments.length,
      replaced_count: replacements.length,
      replacements
    })

  } catch (error) {
    console.error('Error reassigning testers:', error)
    return NextResponse.json(
      { error: 'Failed to reassign testers' },
      { status: 500 }
    )
  }
}
