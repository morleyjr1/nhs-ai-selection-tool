"use client";

import Link from "next/link";
import { NHS_COLOURS } from "../../lib/constants";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl font-bold mt-10 mb-3"
      style={{ color: NHS_COLOURS.darkBlue }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-base font-semibold mt-6 mb-2"
      style={{ color: NHS_COLOURS.darkText }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm leading-relaxed mb-3"
      style={{ color: NHS_COLOURS.darkText }}
    >
      {children}
    </p>
  );
}

function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol
      className="text-sm leading-relaxed mb-4 space-y-1.5 list-decimal pl-6"
      style={{ color: NHS_COLOURS.darkText }}
    >
      {children}
    </ol>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="text-sm leading-relaxed mb-4 space-y-1.5 list-disc pl-6"
      style={{ color: NHS_COLOURS.darkText }}
    >
      {children}
    </ul>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: NHS_COLOURS.white }}>
      {/* Top bar */}
      <header
        className="px-6 py-4 border-b print:hidden"
        style={{ borderColor: NHS_COLOURS.lightGrey }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <span className="text-lg font-bold" style={{ color: NHS_COLOURS.darkBlue }}>
            NHS AI Selection Tool — User guide
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium"
              style={{ color: NHS_COLOURS.blue }}
            >
              ← Back to the tool
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded text-sm font-medium"
              style={{ backgroundColor: NHS_COLOURS.blue, color: NHS_COLOURS.white }}
            >
              Print / save as PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: NHS_COLOURS.darkBlue }}
        >
          How this tool works
        </h1>
        <p className="text-base mb-2" style={{ color: NHS_COLOURS.secondaryText }}>
          A user guide to the logic of the framework, with worked examples.
        </p>

        <H2>1. What this tool is, and what it is not</H2>
        <P>
          Adopting an AI tool is rarely a simple yes or no. The same tool can be a
          sensible choice for one organisation and a serious risk for another,
          because what matters is not the tool in the abstract but the fit between
          what the tool demands and what the deploying organisation can provide.
          This tool makes that fit explicit, and it does so in a structured,
          repeatable way.
        </P>
        <P>
          It is a <strong>diagnostic instrument, not a prescriptive one</strong>.
          It will tell you <em>where</em> the risks and gaps lie, how serious they
          are, and which to address first. It will not tell you exactly{" "}
          <em>what</em> to do to close them, because that depends on knowledge of
          your organisation, your patients, and your local context that no
          standardised instrument can hold. Used well, it is the structured
          conversation to have before and alongside the formal processes that
          govern AI in the NHS — a Data Protection Impact Assessment, clinical
          safety work under DCB0129 and DCB0160, the Digital Technology Assessment
          Criteria, and medical-device regulation. It does not replace any of them.
        </P>
        <P>
          It is most useful <strong>early</strong> — while horizon-scanning,
          building a business case, or preparing for procurement — when its
          findings can still shape the decision rather than justify one already
          made. And it is most usefully completed by a{" "}
          <strong>multidisciplinary group</strong> rather than one person, because
          the questions span clinical, technical, governance, and operational
          ground that no single role sees in full.
        </P>

        <H2>2. The core idea: complexity against readiness</H2>
        <P>
          The tool rests on a single, simple idea expressed as a paired framework.
          It assesses twelve <strong>complexity</strong> dimensions — properties of
          the tool, such as how hard its task is, how its data behaves, how much it
          must integrate with existing systems, and what happens if it is wrong —
          and pairs each with a matching <strong>readiness</strong> dimension — the
          corresponding capability of your organisation, such as its data
          infrastructure, its capacity for clinical oversight, or its
          information-governance expertise.
        </P>
        <P>
          Each of the twelve pairs is scored on the same three-point scale. Where a
          tool&apos;s complexity on a dimension outruns your organisation&apos;s
          readiness on the same dimension, you have a <strong>gap</strong>. The
          size of that gap is simply the readiness shortfall: complexity minus
          readiness, never below zero.
        </P>
        <UL>
          <li>
            A gap of <strong>2</strong> (complexity 3, readiness 1) is a{" "}
            <strong>major gap</strong>.
          </li>
          <li>
            A gap of <strong>1</strong> is a <strong>minor gap</strong>.
          </li>
          <li>
            A gap of <strong>0</strong> means readiness meets or exceeds what the
            tool demands on that dimension.
          </li>
        </UL>
        <P>
          The pattern of gaps across the twelve dimensions, together with a small
          number of non-negotiable safety checks, produces one of four
          recommendations: <strong>Quick win</strong>,{" "}
          <strong>Deploy and monitor</strong>,{" "}
          <strong>Build readiness first</strong>, or <strong>Avoid</strong>. The
          logic behind that translation is set out in section 7.
        </P>

        <H2>3. The framing questions</H2>
        <P>
          Before any scoring, two threshold questions must both be answered
          &ldquo;Yes&rdquo;. They are deliberately blunt, because if either fails,
          the detailed assessment is moot.
        </P>
        <OL>
          <li>
            <strong>Proportionality.</strong> Is the use of AI proportionate to the
            problem? Could the problem be addressed adequately by non-AI means —
            process redesign, better use of existing data, improved pathways, or a
            simpler digital tool — with comparable effect and lower risk?
          </li>
          <li>
            <strong>Needs-led adoption.</strong> Does the tool address a clearly
            identified clinical or operational need that would not be met as well
            without AI? Or is adoption being driven by enthusiasm, vendor
            marketing, or organisational pressure?
          </li>
        </OL>
        <P>
          If AI is not proportionate, or adoption is not needs-led, the framework
          asks you to reconsider before going further. Structured guiding questions
          for both — from the DTAC assessment form, the NICE Evidence Standards
          Framework, and the NHS Buyer&apos;s Guide — are linked on the page.
        </P>

        <H2>4. Basic data, and why it shapes the assessment</H2>
        <P>
          Before scoring, you describe the tool. Most of this is for the record and
          to drive the automated searches (FDA, PubMed, ClinicalTrials.gov, and the
          security and standards checks). Four inputs, however, change the
          assessment itself, because they set <strong>scoring floors</strong> —
          minimum complexity scores that certain properties force, regardless of
          the assessor&apos;s own view.
        </P>
        <UL>
          <li>
            <strong>Function (autonomy tier).</strong> From administrative, through
            administrative-in-a-clinical-setting and clinical decision support, to
            bounded-autonomous and fully-autonomous clinical function. Any
            autonomous tool (it acts without a clinician reviewing each output)
            forces human-oversight and safety-consequence to at least moderate.
          </li>
          <li>
            <strong>Agentic.</strong> Whether the tool plans and carries out
            multi-step sequences of actions towards a goal, rather than producing a
            single output. An agentic tool inherits the same floors as a stochastic
            one. A tool that is <strong>both agentic and autonomous</strong> has its
            oversight, validation, safety, and monitoring dimensions held at the
            maximum: the highest-scrutiny combination the framework recognises.
          </li>
          <li>
            <strong>Stochastic or deterministic.</strong> A stochastic tool — one
            that can give different outputs from the same input — forces oversight,
            validation, and monitoring to at least moderate.
          </li>
          <li>
            <strong>Device classification.</strong> A Class IIb device forces safety
            to at least moderate; a Class III device forces it to the maximum.
          </li>
        </UL>
        <P>
          The floors are cumulative: where several apply, the highest wins. Their
          purpose is to stop an assessor from quietly under-scoring the dimensions
          where the stakes are highest.
        </P>
        <P>
          A note on the four required inputs that can halt the assessment: if you do
          not know the device classification, whether the tool is agentic, or
          whether it is stochastic or deterministic, or you report that the
          development team is unaware of the relevant regulatory requirements, the
          tool stops and asks you to find out first. These are not obstacles for
          their own sake — without them, the floors cannot be calculated and the
          assessment would be unreliable.
        </P>

        <H2>5. How scoring works</H2>
        <P>
          Each of the twenty-four dimensions is scored{" "}
          <strong>1 (low), 2 (moderate), or 3 (high)</strong> against descriptors
          written for that dimension. A few features are worth understanding.
        </P>
        <UL>
          <li>
            <strong>Justifications.</strong> A short free-text reason can be
            recorded for each score. It is optional but recommended: it is what
            makes the assessment auditable and what a second reader will use to
            challenge a score.
          </li>
          <li>
            <strong>&ldquo;I don&apos;t know&rdquo; is a valid answer — and a hard
            stop.</strong> If you cannot score a dimension, say so. The assessment
            cannot be finalised until every dimension is scored, and the tool points
            you to who can usually answer — the vendor, the clinical safety officer,
            the information-governance lead, and so on. A gap in knowledge should
            send you to the right person, not to a guess.
          </li>
          <li>
            <strong>Consistency flags.</strong> The tool scans the free-text reasons
            you record for particular keywords — &ldquo;real-time&rdquo;,
            &ldquo;cloud&rdquo;, &ldquo;autonomous&rdquo;, and the like — and where
            one appears against a dimension you have scored low, it raises an amber
            flag inviting you to reconsider. This is simple keyword matching, not a
            judgement about your reasoning, so it will only fire if you have written
            a justification containing the trigger wording. The flags are advisory,
            never blocking.
          </li>
          <li>
            <strong>Sub-trigger questions.</strong> A small number of yes/no
            questions appear only when the scores indicate the risk is live — for
            instance, whether you have a corrective-and-preventive-action process,
            which is asked only when the safety consequence is moderate or high. A
            &ldquo;no&rdquo; to one of these can fire a hard gate on its own.
          </li>
          <li>
            <strong>Worked examples and &ldquo;what good looks like&rdquo;.</strong>{" "}
            Each complexity dimension carries illustrative example answers for
            several archetypal tools; each readiness dimension describes what strong
            readiness looks like and links to tools that help build it. Both are
            guidance, not scores to copy.
          </li>
        </UL>

        <H2>6. The twenty-four dimensions</H2>
        <H3>Complexity (the tool)</H3>
        <OL>
          <li><strong>Task &amp; Decision Complexity</strong> — how well-defined and personalised the task is.</li>
          <li><strong>Data Complexity</strong> — the data the tool needs to run: sources, quality-sensitivity, timeliness.</li>
          <li><strong>Information Governance</strong> — data flows, sharing, lawful basis, and the IG work required.</li>
          <li><strong>Human Oversight Complexity</strong> — how readily a user can verify and challenge the output.</li>
          <li><strong>Validation Complexity</strong> — how hard it is to establish that the output is correct.</li>
          <li><strong>Technical Integration</strong> — what the tool must connect to, and how automated it is.</li>
          <li><strong>Workflow &amp; Organisational Change</strong> — how much it changes work, roles, and pathways.</li>
          <li><strong>Evaluation Complexity</strong> — how hard it is to show real-world benefit.</li>
          <li><strong>Safety Consequence</strong> — the severity, reversibility, and speed of harm if it is wrong.</li>
          <li><strong>Values, Trust &amp; Equity</strong> — acceptability, the risk of widening inequalities, and consent.</li>
          <li><strong>Monitoring &amp; Drift Detection</strong> — how hard it is to detect and respond to performance change.</li>
          <li><strong>Vendor &amp; Supply Chain</strong> — transparency, dependency, and the consequences of vendor failure.</li>
        </OL>
        <H3>Readiness (the organisation)</H3>
        <P>
          Each readiness dimension mirrors its complexity pair: R1 domain expertise
          and decision governance; R2 data infrastructure; R3 information-governance
          capability; R4 human-oversight capacity; R5 validation and evidence
          assessment; R6 technical infrastructure; R7 operational and change
          management; R8 evaluation capacity; R9 clinical safety and risk
          management; R10 ethics and public engagement; R11 monitoring and lifecycle
          management; R12 vendor and supply-chain management.
        </P>

        <H2>7. From scores to a verdict</H2>
        <P>
          Two things turn the scores into a recommendation: the hard gates, and the
          classification rules.
        </P>
        <H3>Hard gates</H3>
        <P>
          A hard gate is a non-negotiable pairing of high tool-complexity with
          absent organisational readiness. Any one of seven forces an{" "}
          <strong>Avoid</strong>, regardless of how good the rest of the picture
          looks:
        </P>
        <UL>
          <li><strong>Safety</strong> — safety consequence is high (C9 = 3) and there is no systematic AI safety process (R9 = 1).</li>
          <li><strong>Human Oversight</strong> — outputs are structurally hard to verify (C4 = 3) and there are no oversight policies (R4 = 1).</li>
          <li><strong>Information Governance</strong> — complex cross-organisational data flows (C3 = 3) and only standard IG capability (R3 = 1).</li>
          <li><strong>Technical Integration</strong> — bespoke multi-system integration (C6 = 3) and only basic IT (R6 = 1).</li>
          <li><strong>Monitoring</strong> — bespoke drift detection needed (C11 = 3) and no monitoring process (R11 = 1).</li>
          <li><strong>Values, Trust &amp; Equity</strong> — contested ethical questions (C10 = 3) and no engagement or equity process (R10 = 1).</li>
          <li><strong>Vendor</strong> — high integration <em>and</em> high dependency (C6 = 3, C12 = 3) and no procurement or exit strategy (R12 = 1).</li>
        </UL>
        <P>
          Three of these gates can also fire on a sub-trigger answer alone — no CAPA
          process, no automation-bias mitigation, or no exit provision for a deeply
          integrated tool.
        </P>
        <H3>Classification rules</H3>
        <P>
          With the gates checked, the verdict follows a decision tree; the first
          rule that matches wins.
        </P>
        <OL>
          <li><strong>Avoid</strong> — any hard gate has fired, <em>or</em> there are three or more major gaps.</li>
          <li><strong>Build readiness first</strong> — one or two major gaps, <em>or</em> six or more minor gaps.</li>
          <li><strong>Deploy and monitor</strong> — no major gaps, and either three to five minor gaps <em>or</em> an average complexity above 2.0.</li>
          <li><strong>Quick win</strong> — no major gaps, two or fewer minor gaps, and average complexity at or below 2.0.</li>
        </OL>
        <P>
          The logic is deliberately weighted toward caution: a single major gap is
          enough to say &ldquo;build readiness first&rdquo;, and a single hard gate
          is enough to say &ldquo;avoid&rdquo;.
        </P>
        <H3>How gaps are prioritised</H3>
        <P>
          Where gaps exist, the tool orders them for attention, not just by size.
          The sequence is: (1) any pairing at or near a hard gate; (2) safety and
          oversight gaps (dimensions 4 and 9); (3) the precondition dimensions —
          governance, data, and IG (1, 2, 3) — which tend to block progress on
          everything downstream; (4) major gaps before minor; (5) cross-cutting
          dimensions before single-issue ones of the same size.
        </P>

        <H2>8. Reading your results</H2>
        <P>
          The results page gives you: the <strong>classification</strong> and a
          plain-language recommendation; a <strong>gap map</strong> showing all
          twelve pairings at a glance; the <strong>prioritised gaps</strong>, each
          linking to external tools matched to that readiness dimension; and any{" "}
          <strong>hard gates</strong> that fired, with an explanation. You can export
          the full assessment as a <strong>PDF report</strong> or as{" "}
          <strong>JSON</strong> to re-import later. Remember the standing caveat: the
          tool tells you where to focus; deciding what to do is the work of your
          implementation team.
        </P>

        <H2>9. Three worked examples</H2>
        <P>
          These are fictional, illustrative walk-throughs using anonymised
          archetypes. The scores are plausible but invented; a real assessment would
          be done by the team that knows the tool and the organisation.
        </P>

        <H3>Example A — FlowCast (operational demand forecasting) → Quick win</H3>
        <P>
          <strong>The tool.</strong> FlowCast forecasts A&amp;E attendances and
          admissions from historical activity, seasonal trends, and weather, to help
          plan staffing and beds. It is administrative, not agentic, deterministic,
          and not a medical device. The development team is aware of the relevant
          (limited) regulatory requirements.
        </P>
        <P>
          <strong>Framing.</strong> Proportionate? Yes — the alternative is unaided
          manual planning. Needs-led? Yes — winter pressures create a clear
          operational need. <strong>Floors.</strong> None apply. <strong>Complexity</strong>{" "}
          is low to moderate throughout — most dimensions 1 or 2, none high (data 2,
          integration 2, monitoring 2; safety 1, oversight 1, IG 1). Average
          complexity ≈ 1.7. <strong>Readiness.</strong> The trust runs this kind of
          operational analytics already; readiness meets or exceeds complexity on
          every dimension.
        </P>
        <P>
          <strong>Result.</strong> No gaps, no hard gates, average complexity below
          2.0 → <strong>Quick win</strong>. The interpretation: adopt, with
          proportionate routine monitoring. The work here is operational, not a
          readiness-building programme.
        </P>

        <H3>Example B — ScanRead (diagnostic image interpretation) → Build readiness first</H3>
        <P>
          <strong>The tool.</strong> ScanRead reads mammograms and flags recall /
          no-recall for a radiologist to confirm, used as an independent reader in
          double-reading. It is clinical decision support, not agentic,
          deterministic, and a Class IIa device. The team is regulatory-aware.
        </P>
        <P>
          <strong>Framing.</strong> Proportionate and needs-led: both Yes.{" "}
          <strong>Floors.</strong> None forced — decision support is not autonomous,
          the tool is deterministic, and Class IIa sits below the device floors.{" "}
          <strong>Complexity</strong> is moderate across the board — essentially 2 on
          every dimension: a defined but uncertain task, identifiable imaging data
          through a vendor, a delayed and variable reference standard, real
          subgroup-equity questions, and a need for ongoing drift monitoring. Average
          complexity ≈ 2.0.
        </P>
        <P>
          <strong>Readiness.</strong> This trust is newer to clinical AI. It has
          solid IT and clinical leadership (readiness 2 on most dimensions), but its
          validation capacity, evaluation capacity, clinical-safety processes for AI,
          public engagement, and monitoring are not yet in place — readiness 1 on R3,
          R5, R8, R9, R10, and R11. That produces six minor gaps and no major gaps;
          because no complexity dimension reaches 3, no hard gate can fire.
        </P>
        <P>
          <strong>Result.</strong> Six minor gaps → <strong>Build readiness first</strong>.
          The prioritised list puts the safety gap (dimension 9) and the precondition
          IG gap (dimension 3) first, then validation, monitoring, evaluation, and
          equity — each linked to concrete tools such as a DCB0160 clinical safety
          case, local validation guidance, and the STANDING Together equity
          recommendations. The tool is sound; the organisation needs to build the
          scaffolding around it before going live.
        </P>

        <H3>Example C — CareAgent (autonomous, agentic patient-facing care agent) → Avoid</H3>
        <P>
          <strong>The tool.</strong> CareAgent holds open-ended conversations with
          patients — post-discharge check-ins, chronic-care follow-up — taking
          histories, giving advice, and acting across several tasks in a single call.
          It is fully autonomous, agentic, stochastic, and (in this scenario) a Class
          III device. The team is regulatory-aware.
        </P>
        <P>
          <strong>Framing.</strong> Both Yes — there is a genuine capacity problem it
          could address. <strong>Floors.</strong> Because it is both agentic and
          autonomous, human oversight, validation, safety, and monitoring are held at
          the maximum (3). Class III independently fixes safety at 3, and stochastic
          behaviour reinforces the oversight, validation, and monitoring floors. In
          practice every complexity dimension here is high.
        </P>
        <P>
          <strong>Complexity</strong> is 3 across all twelve dimensions: an unbounded
          conversational task, live multi-system data, novel and contested data
          flows, output that cannot be verified in real time, many simultaneous error
          modes, and direct determination of clinical action with a short
          time-to-harm. <strong>Readiness.</strong> This is a capable, large trust —
          but it has not built the specific capabilities an autonomous, agentic,
          patient-facing tool demands. Several readiness dimensions sit at 1: no
          AI-specific safety process (R9), no oversight policy for unverifiable output
          (R4), no AI-IG experience (R3), no monitoring for generative drift (R11),
          and no engagement or equity process for autonomous patient contact (R10).
        </P>
        <P>
          <strong>Result.</strong> Multiple hard gates fire at once — Safety, Human
          Oversight, Information Governance, Monitoring, and Values — and there are
          well over three major gaps. Either condition alone forces{" "}
          <strong>Avoid</strong>. The interpretation is not &ldquo;never&rdquo;, but
          &ldquo;not this tool, in this organisation, as things stand&rdquo;: the gap
          between what the tool demands and what the organisation can currently
          provide is too wide to close inside a deployment timetable, and the
          consequences of getting it wrong are severe and fall directly on patients.
        </P>

        <H2>10. The eight worked-example archetypes</H2>
        <P>
          The tool uses eight archetypal tools — composites, not real products — as
          running illustrations, spanning the range from administrative to fully
          autonomous and agentic: an operational forecaster, an ambient scribe, a
          risk-prediction tool, a diagnostic image reader, a patient-facing triage
          chatbot, an agentic-but-supervised clinical copilot, a bounded-autonomous
          treatment tool, and a fully autonomous agentic care agent. They are
          introduced on the landing page and used in the per-dimension example
          answers.
        </P>

        <H2>11. Relationship to the AI Readiness Checklist</H2>
        <P>
          This framework can be used alongside the{" "}
          <a
            href="https://www.cersi-ai.org/the-ai-readiness-checklist/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: NHS_COLOURS.blue }}
          >
            AI Readiness Checklist
          </a>{" "}
          (CERSI-AI / University of Birmingham), which assesses readiness for a
          specific tool from a harms-and-controls angle. The two line up closely,
          so they make good companions: where this tool tells you the size of a
          readiness gap, the checklist helps you enumerate the specific controls
          that close it.
        </P>
        <P>
          Its five <strong>control</strong> categories map onto our readiness
          side, and its five <strong>harm</strong> categories onto our complexity
          side:
        </P>
        <UL>
          <li>Organisational Structure → R1, R7</li>
          <li>Human Capital → R4, R7</li>
          <li>Problem Formulation → the framing questions and R1</li>
          <li>Adoption &amp; Integration → R2, R6, R7</li>
          <li>Evaluation &amp; Monitoring → R8, R9, R11</li>
          <li>Workforce &amp; Operational harms → C2, C4, C6, C12</li>
          <li>Financial harms → C12</li>
          <li>External harms → C3, C9, C10</li>
          <li>Service-Outcome harms → C5, C8, C10, C11</li>
        </UL>

        <H2>12. Scope, limitations, and feedback</H2>
        <P>
          The framework assesses one tool at a time, but readiness is not independent
          across tools: the burden on governance, workforce, infrastructure, and
          monitoring accumulates, so an organisation comfortable with one tool may be
          overstretched by four. Where several tools are in view, assess each and read
          the readiness scores side by side. The tool is a structured aid to
          judgement, not a substitute for it, and its outputs are only as good as the
          honesty of the inputs. Feedback — and suggestions of readiness-building
          tools we have missed — is welcome through the links provided in the tool.
        </P>

        <div className="mt-10 print:hidden">
          <Link
            href="/"
            className="text-sm font-medium"
            style={{ color: NHS_COLOURS.blue }}
          >
            ← Back to the tool
          </Link>
        </div>
      </main>
    </div>
  );
}
