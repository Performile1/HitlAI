# HitlAI: Gemini AI Consultation Document

**Date**: January 10, 2026  
**Status**: 40% Complete - Need Strategic Guidance

---

## 🎯 What is HitlAI?

Hybrid AI-human UX testing platform:
- **AI agents** test websites/apps automatically (fast, cheap)
- **Human testers** validate and catch what AI misses (authentic)
- **Learning loop**: AI learns from human behavior to improve

**Value**: Companies get comprehensive UX testing faster and cheaper than traditional methods.

---

## ✅ What Works (40%)

1. **AI Testing Core**: 12 agents, orchestration, friction detection ✅
2. **Web Testing**: Crawl4AI, JavaScript rendering ✅
3. **Monitoring**: AgentMonitor, CircuitBreaker, ContextPruner ✅
4. **Database**: 43+ tables, complete schema ✅
5. **Security (Partial)**: CrossVerifier, TesterVerifier, VelocityChecker ✅

---

## ❌ What's Missing (60%)

### **1. Company Workflow** ❌
- App upload (.apk, .ipa)
- Demographic targeting UI
- AI/Human ratio selector
- Credit purchase system

### **2. Tester Experience** ❌
- Test viewer (iframe/window to see app)
- Comment/annotation system
- Tester dashboard
- Test acceptance workflow

### **3. Quality System** ❌
- Tester performance ratings
- Dynamic rate adjustment
- Quality scoring algorithm

### **4. Security Gaps** ⚠️
- Malware scanning for uploads
- Sandboxing for app execution
- AI laziness detection
- AI exhaustion monitoring

---

## 📅 Implementation Plan

**Phase 1 (3 weeks)**: Test viewer, comments, tester dashboard, credit system  
**Phase 2 (2 weeks)**: Rating system, malware scanning, AI quality control  
**Phase 3 (2 weeks)**: Mobile testing, advanced AI features

---

## 🤖 Questions for Gemini

### **1. Architecture Decisions**

**Test Viewer**:
- Iframe vs browser extension vs cloud device farm?
- How to handle CORS for iframe?
- Mobile: WebADB + Appetize.io or BrowserStack?

**Comment System**:
- Real-time (WebSocket) or async?
- Video timestamps or step numbers?
- Screenshot annotations: canvas overlay or separate tool?

### **2. Economics**

**Pricing**:
- AI test: 1 credit ($1.50) - costs us $0.80
- Human test: 10 credits ($15) - pay tester $5-15
- Fair pricing?

**Tester Pay**:
- Base: $10/test
- 5-star tester: $15/test
- 2-star tester: $7/test
- Reasonable?

### **3. Security**

**Malware Scanning**:
- VirusTotal API ($500/month) vs ClamAV (free)?
- Scan every upload or only suspicious?

**Sandboxing**:
- Docker containers sufficient?
- Network isolation level?

### **4. AI Quality**

**Hallucination Prevention**:
- Current: CrossVerifier compares vision to DOM
- Add: Multi-model verification (GPT-4 + Claude + Gemini)?
- Confidence threshold: reject if models disagree >30%?

**Laziness Detection**:
- Flag if AI completes <80% of steps?
- Auto-retry with different model?

**Exhaustion Monitoring**:
- Switch models if error rate increases >20%?
- Fallback chain: GPT-4 → Claude → Gemini → Human?

### **5. Learning Loop**

**AI Learning from Humans**:
- Retrain how often? (Daily, weekly, per 100 tests?)
- Use all human tests or only high-rated ones?
- Fine-tuning vs prompt engineering vs RAG?

**Demographic-Specific AI**:
- Separate model per demographic (senior, low-vision)?
- Or single model with demographic-aware prompts?
- How to handle small samples (only 5 senior testers)?

**Quality Validation**:
- If human disagrees with AI, who's right?
- How to use human corrections to improve AI?
- Track AI accuracy improvement over time?

---

## 🎯 Strategic Questions

### **1. Are We Right?**

**Current Approach**: AI tests first → Human validates → AI learns

**Concerns**:
- Is AI-first the right order?
- Will companies pay 10x more for human tests?
- Can AI actually learn from humans effectively?

### **2. Are We Missing Anything?**

**Potential Gaps**:
- Accessibility testing (screen readers)?
- Performance testing (load times)?
- Cross-browser testing?
- Localization testing?
- Regression testing?
- A/B testing?

**Business Model**:
- Subscription vs pay-per-test?
- Enterprise plans?
- White-label for agencies?

### **3. How Would You Approach This?**

**Implementation Priority**:
1. Test viewer + comments (enable human testers)
2. Credit system (enable payments)
3. Rating system (quality control)
4. Mobile testing (expand market)
5. Advanced AI (improve accuracy)

**Is this the right order?**

### **4. Agent Assignment**

**Who builds what?**

- **Full-Stack Dev**: Test viewer, credit system, dashboards
- **QA Engineer**: Quality scoring, AI laziness detection
- **DevOps/Security**: Malware scanning, sandboxing
- **ML Engineer**: AI-human learning loop, multi-model verification
- **UX Designer**: Test viewer UI, annotation tool

**Agree with assignments?**

### **5. Learning Loop Design**

**How to ensure humans teach AI correctly?**

**Ideas**:
1. Cross-validation: Multiple humans test same app
2. Expert review: Senior testers review junior feedback
3. AI confidence scoring: Only learn from high-confidence human corrections
4. Demographic clustering: Group similar testers, train separate models

**If multiple testers of same demographic (e.g., 10 seniors), should they:**
- A) Build one "senior AI tester" that improves over time?
- B) Each train their own AI persona?
- C) Hybrid: Shared base model + individual fine-tuning?

**Which approach is best?**

---

## 💡 Key Decisions Needed

1. **Test viewer technology**: Iframe, extension, or cloud?
2. **Mobile testing**: Self-hosted or BrowserStack?
3. **Malware scanning**: VirusTotal or ClamAV?
4. **AI learning**: Fine-tuning, prompts, or RAG?
5. **Demographic AI**: Separate models or shared with prompts?
6. **Implementation order**: Viewer first or credits first?

---

## 📊 Current Status Summary

**Implemented (40%)**:
- AI testing engine
- Web crawling
- Monitoring layer
- Database schema
- Basic security

**Missing (60%)**:
- Human tester workflow
- Mobile testing
- Credit system
- Quality ratings
- Advanced security

**Next Step**: Implement Phase 1 (test viewer, comments, credits) to enable human testers.

---

**Help us validate this plan and answer the strategic questions above.**
