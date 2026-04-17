import { useEffect, useMemo, useState } from 'react'
import type { CvData } from '../../data/cv'
import { PortfolioPage } from '../../components/PortfolioPage'
import { resumeJsonToCvData, type ResumeJson } from '../../utils/jsonFormatter'
import { parseCvData, parseResumeJson } from '../../utils/jsonValidation'
import { CvEditor } from './CvEditor'
import './PortfolioFromPdfModal.css'

type Step = 'input' | 'edit'

export function PortfolioFromPdfModal({
  open,
  onClose,
  onConfirm,
  canClose = true,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (data: CvData) => void
  canClose?: boolean
}) {
  const [step, setStep] = useState<Step>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<CvData | null>(null)
  const [preview, setPreview] = useState(false)
  const [rawJson, setRawJson] = useState<string>('')
  const [debugResumeJson, setDebugResumeJson] = useState<string | null>(null)
  const [debugCvJson, setDebugCvJson] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, canClose])

  useEffect(() => {
    if (!open) return
    setStep('input')
    setLoading(false)
    setError(null)
    setDraft(null)
    setPreview(false)
    setRawJson('')
    setDebugResumeJson(null)
    setDebugCvJson(null)
  }, [open])

  const canGenerate = useMemo(() => Boolean(rawJson.trim()) && !loading, [rawJson, loading])

  if (!open) return null

  const parseRawJson = (value: unknown): { cvData: CvData; resume: ResumeJson | null } => {
    try {
      const cv = parseCvData(value)
      return { cvData: cv, resume: null }
    } catch {
      const resume = parseResumeJson(value)
      return { cvData: resumeJsonToCvData(resume), resume }
    }
  }

  const onGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const parsed = JSON.parse(rawJson) as unknown
      const { cvData, resume } = parseRawJson(parsed)
      setDraft(cvData)
      setDebugResumeJson(resume ? JSON.stringify(resume, null, 2) : null)
      setDebugCvJson(JSON.stringify(cvData, null, 2))
      setStep('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    } finally {
      setLoading(false)
    }
  }

  const confirm = () => {
    if (!draft) return
    onConfirm(draft)
    onClose()
  }

  return (
    <div
      className="pdf-modal__backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (!canClose) return
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="pdf-modal__panel glass-card">
        <div className="pdf-modal__header">
          <div className="pdf-modal__title">Generate Portfolio From JSON</div>
          <div className="pdf-modal__actions">
            {canClose ? (
              <button type="button" className="btn" onClick={onClose}>
                Close
              </button>
            ) : null}
            {step === 'edit' ? (
              <>
                <button type="button" className="btn" onClick={() => setPreview((v) => !v)}>
                  {preview ? 'Edit' : 'Preview'}
                </button>
                <button type="button" className="btn btn--primary" onClick={confirm}>
                  Confirm & Generate
                </button>
              </>
            ) : null}
          </div>
        </div>

        {step === 'input' ? (
          <div className="pdf-upload">
            <div className="pdf-upload__hint">
              Paste JSON (either full CV data or a simpler resume JSON). We will validate it and generate the portfolio
              for you to review and edit.
            </div>
            <div className="field">
              <label>JSON input</label>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder='Example (ResumeJson): { "name": "Jane Doe", "email": "jane@doe.com", "phone": "+1 555 123 4567", "skills": ["React"], "education": [], "experience": [], "projects": [] }'
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              />
            </div>
            {error ? <div className="pdf-error">{error}</div> : null}
            <div className="pdf-modal__actions">
              <button type="button" className="btn btn--primary" onClick={onGenerate} disabled={!canGenerate}>
                {loading ? 'Validating...' : 'Validate & Generate'}
              </button>
            </div>
          </div>
        ) : null}

        {step === 'edit' && draft ? (
          preview ? (
            <div className="pdf-preview">
              <PortfolioPage data={draft} />
            </div>
          ) : (
            <>
              <CvEditor value={draft} onChange={setDraft} />
              {debugResumeJson ? (
                <details className="pdf-details">
                  <summary className="pdf-details__summary">Show ResumeJson (debug)</summary>
                  <pre className="pdf-details__pre">{debugResumeJson}</pre>
                </details>
              ) : null}
              {debugCvJson ? (
                <details className="pdf-details">
                  <summary className="pdf-details__summary">Show CvData (debug)</summary>
                  <pre className="pdf-details__pre">{debugCvJson}</pre>
                </details>
              ) : null}
            </>
          )
        ) : null}
      </div>
    </div>
  )
}

