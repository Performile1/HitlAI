# HitlAI - Sequence Diagrams

**Version:** 1.0  
**Last Updated:** January 16, 2026

---

## Table of Contents

1. [AI Test Execution Flow](#ai-test-execution-flow)
2. [Human Test Assignment Flow](#human-test-assignment-flow)
3. [Hybrid Test Flow](#hybrid-test-flow)
4. [Early Adopter Application Flow](#early-adopter-application-flow)
5. [Milestone Unlock Flow](#milestone-unlock-flow)
6. [Fine-Tuning Job Flow](#fine-tuning-job-flow)

---

## AI Test Execution Flow

```
Company          Next.js API       Orchestrator      AI Engine        Database
   │                 │                  │                │               │
   │─────POST────────▶│                 │                │               │
   │ /api/test/      │                  │                │               │
   │ execute         │                  │                │               │
   │                 │                  │                │               │
   │                 │──Validate────────▶│               │               │
   │                 │  Request          │               │               │
   │                 │                   │               │               │
   │                 │                   │──Check────────▶               │
   │                 │                   │  Quota         │               │
   │                 │                   │                │               │
   │                 │                   │◀──Quota OK─────│               │
   │                 │                   │                │               │
   │                 │                   │──Get Current───▶               │
   │                 │                   │  Phase         │               │
   │                 │                   │                │               │
   │                 │                   │◀──Phase 1──────│               │
   │                 │                   │                │               │
   │                 │                   │──Create────────▶               │
   │                 │                   │  test_run      │               │
   │                 │                   │  (status:      │               │
   │                 │                   │   pending)     │               │
   │                 │                   │                │               │
   │                 │◀──Test Run ID─────│                │               │
   │◀────202─────────│                   │                │               │
   │ Accepted        │                   │                │               │
   │ {test_run_id}   │                   │                │               │
   │                 │                   │                │               │
   │                 │                   │──Select Model──▶               │
   │                 │                   │  (GPT-4o)      │               │
   │                 │                   │                │               │
   │                 │                   │──Update────────▶               │
   │                 │                   │  (status:      │               │
   │                 │                   │   running)     │               │
   │                 │                   │                │               │
   │                 │                   │                │──Execute──────▶
   │                 │                   │                │  OpenAI API   │
   │                 │                   │                │               │
   │                 │                   │                │◀──Response────│
   │                 │                   │                │               │
   │                 │                   │──Parse─────────▶               │
   │                 │                   │  Results       │               │
   │                 │                   │                │               │
   │                 │                   │──Store─────────▶               │
   │                 │                   │  Results       │               │
   │                 │                   │  (status:      │               │
   │                 │                   │   completed)   │               │
   │                 │                   │                │               │
   │                 │                   │──Update────────▶               │
   │                 │                   │  Milestones    │               │
   │                 │                   │                │               │
   │                 │                   │──Increment─────▶               │
   │                 │                   │  tests_used    │               │
   │                 │                   │                │               │
   │◀────Realtime────────────────────────────────────────────────────────│
   │ Subscription    │                   │                │               │
   │ (test_run       │                   │                │               │
   │  updated)       │                   │                │               │
   │                 │                   │                │               │
```

---

## Human Test Assignment Flow

```
Company     Next.js API    Orchestrator    Matcher       Tester      Database
   │             │              │              │            │            │
   │──POST───────▶│             │              │            │            │
   │ /api/test/  │              │              │            │            │
   │ execute     │              │              │            │            │
   │ (human)     │              │              │            │            │
   │             │              │              │            │            │
   │             │──Validate────▶              │            │            │
   │             │              │              │            │            │
   │             │              │──Create──────▶            │            │
   │             │              │  test_run    │            │            │
   │             │              │  (status:    │            │            │
   │             │              │   pending)   │            │            │
   │             │              │              │            │            │
   │◀────202─────│              │              │            │            │
   │ Accepted    │              │              │            │            │
   │             │              │              │            │            │
   │             │              │──Find Best───▶            │            │
   │             │              │  Tester      │            │            │
   │             │              │  Match       │            │            │
   │             │              │              │            │            │
   │             │              │              │──Query─────▶            │
   │             │              │              │  Available │            │
   │             │              │              │  Testers   │            │
   │             │              │              │            │            │
   │             │              │              │◀──List─────│            │
   │             │              │              │            │            │
   │             │              │◀──Best Match─│            │            │
   │             │              │              │            │            │
   │             │              │──Assign──────▶            │            │
   │             │              │  Tester      │            │            │
   │             │              │              │            │            │
   │             │              │              │            │◀──Notify───│
   │             │              │              │            │  (Email/   │
   │             │              │              │            │   Push)    │
   │             │              │              │            │            │
   │             │              │              │            │──Login─────▶
   │             │              │              │            │            │
   │             │              │              │            │──View──────▶
   │             │              │              │            │  Assignment│
   │             │              │              │            │            │
   │             │              │              │            │──Start─────▶
   │             │              │              │            │  Test      │
   │             │              │              │            │  (status:  │
   │             │              │              │            │   running) │
   │             │              │              │            │            │
   │             │              │              │            │──Execute───│
   │             │              │              │            │  Test      │
   │             │              │              │            │  (10-30    │
   │             │              │              │            │   mins)    │
   │             │              │              │            │            │
   │             │              │              │            │──Submit────▶
   │             │              │              │            │  Report    │
   │             │              │              │            │            │
   │             │              │              │◀──Store────│            │
   │             │              │              │  Results   │            │
   │             │              │              │  (status:  │            │
   │             │              │              │   completed)│           │
   │             │              │              │            │            │
   │             │              │              │──Update────▶            │
   │             │              │              │  Tester    │            │
   │             │              │              │  Stats     │            │
   │             │              │              │            │            │
   │◀────Realtime──────────────────────────────────────────────────────│
   │ Subscription│              │              │            │            │
   │             │              │              │            │            │
```

---

## Hybrid Test Flow

```
Company    Next.js API   Orchestrator   AI Engine   Matcher   Tester   Database
   │            │             │             │          │         │         │
   │──POST──────▶│            │             │          │         │         │
   │ /api/test/ │             │             │          │         │         │
   │ execute    │             │             │          │         │         │
   │ (hybrid)   │             │             │          │         │         │
   │            │             │             │          │         │         │
   │            │──Validate───▶            │          │         │         │
   │            │             │             │          │         │         │
   │            │             │──Create─────▶          │         │         │
   │            │             │  test_run   │          │         │         │
   │            │             │             │          │         │         │
   │◀───202─────│             │             │          │         │         │
   │ Accepted   │             │             │          │         │         │
   │            │             │             │          │         │         │
   │            │             │──Fork───────┬──────────┐         │         │
   │            │             │  Parallel   │          │         │         │
   │            │             │  Execution  │          │         │         │
   │            │             │             │          │         │         │
   │            │             │             │          │         │         │
   │            │             │  ┌──────────▼────┐  ┌──▼─────────┐        │
   │            │             │  │  AI Branch    │  │ Human Branch│        │
   │            │             │  │               │  │             │        │
   │            │             │  │──Execute──────▶  │──Assign─────▶        │
   │            │             │  │  GPT-4o       │  │  Tester     │        │
   │            │             │  │               │  │             │        │
   │            │             │  │◀──AI Results──│  │             │        │
   │            │             │  │               │  │             │◀───────│
   │            │             │  │               │  │             │ Tester │
   │            │             │  │               │  │             │ Submits│
   │            │             │  │               │  │◀──Human─────│        │
   │            │             │  │               │  │  Results    │        │
   │            │             │  └───────┬───────┘  └──┬──────────┘        │
   │            │             │          │             │                   │
   │            │             │──Merge───┴─────────────┘                   │
   │            │             │  Results                                   │
   │            │             │  - Combine issues                          │
   │            │             │  - Average sentiment                       │
   │            │             │  - Deduplicate                             │
   │            │             │                                            │
   │            │             │──Store──────────────────────────────────────▶
   │            │             │  Final Results                             │
   │            │             │  (status: completed)                       │
   │            │             │                                            │
   │◀───Realtime──────────────────────────────────────────────────────────│
   │ Subscription│            │                                            │
   │            │             │                                            │
```

---

## Early Adopter Application Flow

```
Visitor      Marketing Page    Next.js API    Database    Admin     Email
   │               │                │             │          │         │
   │──Visit────────▶               │             │          │         │
   │ /early-adopter │               │             │          │         │
   │               │                │             │          │         │
   │               │──GET───────────▶            │          │         │
   │               │  /api/early-   │             │          │         │
   │               │  adopter/apply │             │          │         │
   │               │                │             │          │         │
   │               │                │──Query──────▶          │         │
   │               │                │  Available  │          │         │
   │               │                │  Spots      │          │         │
   │               │                │             │          │         │
   │               │◀───200─────────│◀──Spots─────│          │         │
   │◀──Display─────│  {spots}       │             │          │         │
   │  Tiers        │                │             │          │         │
   │               │                │             │          │         │
   │──Select───────▶               │             │          │         │
   │  Tier         │                │             │          │         │
   │               │                │             │          │         │
   │──Fill─────────▶               │             │          │         │
   │  Form         │                │             │          │         │
   │               │                │             │          │         │
   │──Submit───────▶               │             │          │         │
   │               │                │             │          │         │
   │               │──POST──────────▶            │          │         │
   │               │  /api/early-   │             │          │         │
   │               │  adopter/apply │             │          │         │
   │               │                │             │          │         │
   │               │                │──Validate───│          │         │
   │               │                │  Data       │          │         │
   │               │                │             │          │         │
   │               │                │──Check──────▶          │         │
   │               │                │  Spots      │          │         │
   │               │                │  Available  │          │         │
   │               │                │             │          │         │
   │               │                │◀──OK────────│          │         │
   │               │                │             │          │         │
   │               │                │──Insert─────▶          │         │
   │               │                │  Application│          │         │
   │               │                │  (status:   │          │         │
   │               │                │   pending)  │          │         │
   │               │                │             │          │         │
   │               │                │──Decrement──▶          │         │
   │               │                │  Available  │          │         │
   │               │                │  Spots      │          │         │
   │               │                │             │          │         │
   │               │◀───201─────────│             │          │         │
   │◀──Redirect────│  Created       │             │          │         │
   │  /application-│                │             │          │         │
   │  success      │                │             │          │         │
   │               │                │             │          │         │
   │               │                │──Send───────────────────────────▶│
   │               │                │  Confirmation Email              │
   │               │                │                                  │
   │               │                │──Notify─────────────────▶        │
   │               │                │  Admin (Slack)          │        │
   │               │                │                         │        │
   │               │                │                         │──Login─│
   │               │                │                         │        │
   │               │                │                         │──Review│
   │               │                │                         │  App   │
   │               │                │                         │        │
   │               │                │                         │──Approve
   │               │                │                         │  or    │
   │               │                │                         │  Reject│
   │               │                │                         │        │
   │               │                │◀──Update────────────────│        │
   │               │                │  (status: approved)     │        │
   │               │                │                         │        │
   │               │                │──Send───────────────────────────▶│
   │               │                │  Approval Email                  │
   │◀──────────────────────────────────────────────────────────────────│
   │ Approval Email│                │                         │        │
   │               │                │                         │        │
```

---

## Milestone Unlock Flow

```
System      Test Completion    Database    Orchestrator    Admin
   │               │               │              │           │
   │               │──Test─────────▶             │           │
   │               │  Completed    │              │           │
   │               │               │              │           │
   │               │               │──Trigger─────▶           │
   │               │               │  update_     │           │
   │               │               │  milestone_  │           │
   │               │               │  progress()  │           │
   │               │               │              │           │
   │               │               │              │──Query────▶
   │               │               │              │  Current  │
   │               │               │              │  Progress │
   │               │               │              │           │
   │               │               │              │◀──Data────│
   │               │               │              │           │
   │               │               │              │──Increment│
   │               │               │              │  Counter  │
   │               │               │              │           │
   │               │               │              │──Check────│
   │               │               │              │  Threshold│
   │               │               │              │           │
   │               │               │              │           │
   │               │               │              │  ┌────────┴────────┐
   │               │               │              │  │ If >= 1,000:    │
   │               │               │              │  │ Unlock Phase 2  │
   │               │               │              │  │                 │
   │               │               │              │  │ If >= 5,000:    │
   │               │               │              │  │ Unlock Phase 3  │
   │               │               │              │  │                 │
   │               │               │              │  │ If >= 10,000:   │
   │               │               │              │  │ Unlock Phase 4  │
   │               │               │              │  └────────┬────────┘
   │               │               │              │           │
   │               │               │              │──Update───▶
   │               │               │              │  milestones│
   │               │               │              │  (is_unlocked│
   │               │               │              │   = true)  │
   │               │               │              │           │
   │               │               │              │──Notify───▶
   │               │               │              │  Admin    │
   │               │               │              │  (Slack)  │
   │               │               │              │           │
   │               │               │              │──Send─────▶
   │               │               │              │  Email to │
   │               │               │              │  All      │
   │               │               │              │  Companies│
   │               │               │              │           │
   │               │               │              │──Update───▶
   │               │               │              │  Pricing  │
   │               │               │              │  (reduce  │
   │               │               │              │   cost)   │
   │               │               │              │           │
```

---

## Fine-Tuning Job Flow

```
Admin      Admin Panel    Next.js API    Database    OpenAI API
   │            │              │             │            │
   │──Login─────▶             │             │            │
   │            │              │             │            │
   │──Navigate──▶             │             │            │
   │  /admin/   │              │             │            │
   │  training  │              │             │            │
   │            │              │             │            │
   │            │──GET─────────▶            │            │
   │            │  /api/admin/ │             │            │
   │            │  training-   │             │            │
   │            │  data/stats  │             │            │
   │            │              │             │            │
   │            │              │──Query──────▶            │
   │            │              │  Training   │            │
   │            │              │  Data       │            │
   │            │              │  (rating>=4)│            │
   │            │              │             │            │
   │            │◀───200───────│◀──Stats─────│            │
   │◀──Display──│  {count,     │             │            │
   │  Stats     │   quality}   │             │            │
   │            │              │             │            │
   │──Click─────▶             │             │            │
   │  "Start    │              │             │            │
   │  Fine-Tune"│              │             │            │
   │            │              │             │            │
   │            │──POST────────▶            │            │
   │            │  /api/admin/ │             │            │
   │            │  training/   │             │            │
   │            │  fine-tune   │             │            │
   │            │              │             │            │
   │            │              │──Fetch──────▶            │
   │            │              │  Training   │            │
   │            │              │  Data       │            │
   │            │              │             │            │
   │            │              │◀──Data──────│            │
   │            │              │             │            │
   │            │              │──Format─────│            │
   │            │              │  JSONL      │            │
   │            │              │             │            │
   │            │              │──Upload─────────────────▶│
   │            │              │  Training   │            │
   │            │              │  File       │            │
   │            │              │             │            │
   │            │              │◀──File ID───────────────│
   │            │              │             │            │
   │            │              │──Create─────────────────▶│
   │            │              │  Fine-Tune  │            │
   │            │              │  Job        │            │
   │            │              │             │            │
   │            │              │◀──Job ID────────────────│
   │            │              │             │            │
   │            │              │──Store──────▶            │
   │            │              │  Job Record │            │
   │            │              │  (status:   │            │
   │            │              │   running)  │            │
   │            │              │             │            │
   │            │◀───202───────│             │            │
   │◀──Display──│  Accepted    │             │            │
   │  Job ID    │              │             │            │
   │            │              │             │            │
   │            │              │             │            │
   │──Poll──────▶             │             │            │
   │  Status    │              │             │            │
   │  (every    │              │             │            │
   │   30s)     │              │             │            │
   │            │              │             │            │
   │            │──GET─────────▶            │            │
   │            │  /api/admin/ │             │            │
   │            │  training/   │             │            │
   │            │  status/     │             │            │
   │            │  {jobId}     │             │            │
   │            │              │             │            │
   │            │              │──Query──────▶            │
   │            │              │  Job Status │            │
   │            │              │             │            │
   │            │              │──Check──────────────────▶│
   │            │              │  OpenAI     │            │
   │            │              │  Status     │            │
   │            │              │             │            │
   │            │              │◀──Status────────────────│
   │            │              │  (succeeded)│            │
   │            │              │  + Model ID │            │
   │            │              │             │            │
   │            │              │──Update─────▶            │
   │            │              │  Job Record │            │
   │            │              │  (status:   │            │
   │            │              │   completed)│            │
   │            │              │             │            │
   │            │◀───200───────│             │            │
   │◀──Display──│  {status,    │             │            │
   │  Complete  │   model_id}  │             │            │
   │            │              │             │            │
   │──Click─────▶             │             │            │
   │  "Deploy"  │              │             │            │
   │            │              │             │            │
   │            │──POST────────▶            │            │
   │            │  /api/admin/ │             │            │
   │            │  training/   │             │            │
   │            │  status/     │             │            │
   │            │  {jobId}     │             │            │
   │            │  (action:    │             │            │
   │            │   deploy)    │             │            │
   │            │              │             │            │
   │            │              │──Update─────▶            │
   │            │              │  Env Var    │            │
   │            │              │  FINE_TUNED_│            │
   │            │              │  MODEL_ID   │            │
   │            │              │             │            │
   │            │◀───200───────│             │            │
   │◀──Success──│  Deployed    │             │            │
   │            │              │             │            │
```

---

**End of Sequence Diagrams**
