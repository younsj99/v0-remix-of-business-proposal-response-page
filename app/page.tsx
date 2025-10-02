"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { saveFormData, loadFormData, clearFormData, hasStoredData } from "@/lib/form-storage"
import Image from "next/image"

type ViewState = "initial" | "accept" | "decline" | "inquire"

export default function ProposalResponsePage() {
  const [viewState, setViewState] = useState<ViewState>("initial")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showContactFormModal, setShowContactFormModal] = useState(false)
  const [showInquirySuccessModal, setShowInquirySuccessModal] = useState(false)
  const [showFinalThankYouModal, setShowFinalThankYouModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false)
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [recipient, setRecipient] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [inquiryErrorMessage, setInquiryErrorMessage] = useState<string>("")
  const [contactErrorMessage, setContactErrorMessage] = useState<string>("")

  const searchParams = useSearchParams()

  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [disableAutoSave, setDisableAutoSave] = useState(false)

  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [inquiryPrivacyConsent, setInquiryPrivacyConsent] = useState(false)
  const [contactPrivacyConsent, setContactPrivacyConsent] = useState(false)

  useEffect(() => {
    const recipientParam = searchParams.get("recipient") || searchParams.get("id") || searchParams.get("name")
    if (recipientParam) {
      setRecipient(recipientParam)
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  })
  const [inquiryData, setInquiryData] = useState({
    email: "",
    message: "",
  })
  const [contactFormData, setContactFormData] = useState({
    name: "", // Added name field
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (hasStoredData()) {
      setShowRestoreDialog(true)
    }
  }, [])

  const handleRestoreData = useCallback(() => {
    const stored = loadFormData()
    if (stored) {
      if (stored.viewState) setViewState(stored.viewState as ViewState)
      if (stored.formData) setFormData(stored.formData)
      if (stored.inquiryData) setInquiryData(stored.inquiryData)
      if (stored.contactFormData) setContactFormData(stored.contactFormData)
      if (stored.privacyConsent !== undefined) setPrivacyConsent(stored.privacyConsent)
      if (stored.inquiryPrivacyConsent !== undefined) setInquiryPrivacyConsent(stored.inquiryPrivacyConsent)
      if (stored.contactPrivacyConsent !== undefined) setContactPrivacyConsent(stored.contactPrivacyConsent)
    }
    setShowRestoreDialog(false)
  }, [])

  const handleDiscardData = useCallback(() => {
    clearFormData()
    setShowRestoreDialog(false)
  }, [])

  useEffect(() => {
    if (disableAutoSave) return

    const timeoutId = setTimeout(() => {
      // Only save if user has started filling out a form
      const hasData =
        formData.name ||
        formData.email ||
        formData.contact ||
        inquiryData.email ||
        inquiryData.message ||
        contactFormData.email ||
        contactFormData.phone

      if (hasData && viewState !== "initial") {
        saveFormData({
          viewState,
          formData,
          inquiryData,
          contactFormData,
          privacyConsent,
          inquiryPrivacyConsent,
          contactPrivacyConsent,
        })
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [
    formData,
    inquiryData,
    contactFormData,
    viewState,
    privacyConsent,
    inquiryPrivacyConsent,
    contactPrivacyConsent,
    disableAutoSave,
  ])

  const isAcceptFormValid = formData.name.trim() !== "" && formData.email.trim() !== "" && privacyConsent
  const isInquiryFormValid =
    inquiryData.email.trim() !== "" && inquiryData.message.trim() !== "" && inquiryPrivacyConsent
  const isContactFormValid =
    contactFormData.name.trim() !== "" && contactFormData.email.trim() !== "" && contactPrivacyConsent // Added name validation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setErrorMessage("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/send-meeting-acceptance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrorMessage(data.error || "제출에 실패했습니다. 다시 시도해주세요.")
        return
      }

      clearFormData()
      setShowSuccessMessage(true)
    } catch (error) {
      console.error("Failed to send meeting acceptance:", error)
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setErrorMessage("")
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isInquirySubmitting) return
    setInquiryErrorMessage("")
    setIsInquirySubmitting(true)

    try {
      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiryData),
      })

      if (!response.ok) {
        const data = await response.json()
        setInquiryErrorMessage(data.error || "제출에 실패했습니다. 다시 시도해주세요.")
        return
      }

      clearFormData()
      setShowInquirySuccessModal(true)
      setInquiryData({ email: "", message: "" })
      setInquiryPrivacyConsent(false)
    } catch (error) {
      console.error("Failed to send inquiry:", error)
      setInquiryErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsInquirySubmitting(false)
    }
  }

  const handleInquiryRetry = () => {
    setInquiryErrorMessage("")
  }

  const handleBackToHome = () => {
    setViewState("initial")
    setShowSuccessMessage(false)
    setFormData({ name: "", email: "", contact: "" })
    setErrorMessage("")
    setInquiryErrorMessage("")
    setPrivacyConsent(false)
    clearFormData()
  }

  const handleInquiryModalClose = () => {
    setShowInquirySuccessModal(false)
    handleBackToHome()
  }

  const handleDecline = () => {
    setShowDeclineModal(true)
  }

  const handleFollowUpResponse = async (allowContact: boolean) => {
    if (allowContact) {
      setShowDeclineModal(false)
      setShowContactFormModal(true)
    } else {
      try {
        await fetch("/api/send-decline-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient,
            allowContact: false,
          }),
        })
      } catch (error) {
        console.error("Failed to send decline notification:", error)
      }
      clearFormData()
      setShowDeclineModal(false)
      setShowFinalThankYouModal(true)
    }
  }

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isContactSubmitting) return
    setContactErrorMessage("")
    setIsContactSubmitting(true)

    try {
      const response = await fetch("/api/send-decline-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          allowContact: true,
          name: contactFormData.name, // Added name to request
          email: contactFormData.email,
          phone: contactFormData.phone,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setContactErrorMessage(data.error || "제출에 실패했습니다. 다시 시도해주세요.")
        return
      }

      clearFormData()
      setShowContactFormModal(false)
      setContactFormData({ name: "", email: "", phone: "" }) // Reset name field
      setContactPrivacyConsent(false)
      setShowFinalThankYouModal(true)
    } catch (error) {
      console.error("Failed to send contact information:", error)
      setContactErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsContactSubmitting(false)
    }
  }

  const handleContactRetry = () => {
    setContactErrorMessage("")
  }

  const handleFinalThankYouClose = () => {
    setShowFinalThankYouModal(false)
    handleBackToHome()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <Image src="/logo.png" alt="Team Sparta" width={180} height={40} priority className="h-8 w-auto" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">이전에 작성 중이던 내용이 있습니다</DialogTitle>
                <DialogDescription className="sr-only">
                  저장된 폼 데이터를 복원할지 선택하는 화면입니다.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-base text-gray-700 leading-relaxed mb-4">이전에 작성하시던 내용을 불러올까요?</p>
                <div className="flex items-start space-x-2 mb-6">
                  <Checkbox
                    id="disable-autosave"
                    checked={disableAutoSave}
                    onCheckedChange={(checked) => setDisableAutoSave(checked as boolean)}
                  />
                  <label htmlFor="disable-autosave" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                    이 기기에서 정보 저장 안 함 (공용 PC인 경우 체크하세요)
                  </label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={handleDiscardData}>
                  새로 작성
                </Button>
                <Button onClick={handleRestoreData}>이어서 작성</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">제안을 검토해주셔서 감사합니다.</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              바쁘신 와중에도 시간을 내어주셔서 감사합니다.
              <br />
              아래에서 선택지를 클릭하여 간단하게 회신을 부탁드립니다.
            </p>
          </div>

          {/* Initial State: Action Buttons */}
          {viewState === "initial" && (
            <>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base py-6 px-6" onClick={() => setViewState("accept")}>
                  🤝 긍정적으로 검토해볼게요 (인터뷰 수락)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base py-6 px-6 bg-transparent"
                  onClick={handleDecline}
                >
                  😔 아쉽지만 다음기회에
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base py-6 px-6 bg-transparent"
                  onClick={() => setViewState("inquire")}
                >
                  🤔 궁금한 점이 있어요 (추가 문의)
                </Button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500 mb-4">아직 결정하지 못했다면 더 알아보세요</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                    <a href="https://tutorteamsparta.ninehire.site/" target="_blank" rel="noopener noreferrer">
                      채용 홈페이지
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                    <a href="https://tutorteamsparta.ninehire.site/recruit" target="_blank" rel="noopener noreferrer">
                      공고 목록
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Accept State: Form */}
          {viewState === "accept" && (
            <Card className="animate-in fade-in duration-500">
              <CardHeader>
                <Button variant="ghost" size="sm" onClick={handleBackToHome} className="w-fit mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  뒤로가기
                </Button>
                <CardTitle className="text-2xl text-center">인터뷰 안내 메일 송부를 위한 정보 입력</CardTitle>
              </CardHeader>
              <CardContent>
                {!showSuccessMessage ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMessage && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex flex-col gap-2">
                          <span>{errorMessage}</span>
                          <span className="text-sm">문제가 지속되면 tutor@teamsparta.co로 직접 연락주세요.</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="w-fit mt-2 bg-transparent"
                          >
                            다시 시도
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        이름 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={errorMessage ? "true" : "false"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        이메일 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        aria-required="true"
                        aria-invalid={errorMessage ? "true" : "false"}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">전화번호</Label>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="text-base"
                      />
                      <p className="text-sm text-gray-500">입력시 카카오톡으로 알림을 받을 수 있어요.</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="privacy-consent"
                          checked={privacyConsent}
                          onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                          aria-required="true"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="privacy-consent"
                            className="text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            개인정보 수집 및 이용에 동의합니다 <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 leading-relaxed space-y-1">
                        <p>• 수집 항목: 이름, 이메일, 전화번호</p>
                        <p>• 이용 목적: 인터뷰 일정 안내 및 채용 절차 진행</p>
                        <p>• 보유 기간: 채용 종료 후 6개월 (채용 관련 법령에 따라 보관)</p>
                        <p>• 귀하는 개인정보 수집 및 이용을 거부할 권리가 있으며, 거부 시 서비스 이용이 제한됩니다.</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={!isAcceptFormValid || isSubmitting}
                      aria-live="polite"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          제출 중...
                        </>
                      ) : (
                        "제출하기"
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4" role="img" aria-label="성공">
                      ✅
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed mb-2">
                      저희 제안을 긍정적으로 검토해주셔서 감사합니다.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mb-2">
                      입력해주신 연락처를 통해 인터뷰 관련 안내 메일을 송부드리겠습니다.
                    </p>
                    <p className="text-base text-gray-600 leading-relaxed mb-6">
                      영업일 기준 5일 내로 담당자가 이메일로 연락드릴 예정입니다.
                    </p>
                    <Button asChild variant="outline">
                      <a href="https://tutorteamsparta.ninehire.site/" target="_blank" rel="noopener noreferrer">
                        팀스파르타와 튜터 알아보기
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inquire State: Form */}
          {viewState === "inquire" && (
            <Card className="animate-in fade-in duration-500">
              <CardHeader>
                <Button variant="ghost" size="sm" onClick={handleBackToHome} className="w-fit mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  뒤로가기
                </Button>
                <CardTitle className="text-2xl text-center">문의사항 작성</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  {inquiryErrorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="flex flex-col gap-2">
                        <span>{inquiryErrorMessage}</span>
                        <span className="text-sm">문제가 지속되면 tutor@teamsparta.co로 직접 연락주세요.</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleInquiryRetry}
                          className="w-fit mt-2 bg-transparent"
                        >
                          다시 시도
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-email">
                      회신 받으실 이메일 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="inquiry-email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={inquiryErrorMessage ? "true" : "false"}
                      placeholder="your@email.com"
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-message">
                      문의 내용 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="inquiry-message"
                      required
                      aria-required="true"
                      aria-invalid={inquiryErrorMessage ? "true" : "false"}
                      aria-describedby="inquiry-message-hint"
                      placeholder="궁금하신 내용을 자유롭게 작성해주세요."
                      value={inquiryData.message}
                      onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                      className="text-base min-h-[150px]"
                    />
                    <p id="inquiry-message-hint" className="text-sm text-gray-500">
                      {inquiryData.message.length}/5000자
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="inquiry-privacy-consent"
                        checked={inquiryPrivacyConsent}
                        onCheckedChange={(checked) => setInquiryPrivacyConsent(checked as boolean)}
                        aria-required="true"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="inquiry-privacy-consent"
                          className="text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          개인정보 수집 및 이용에 동의합니다 <span className="text-red-500">*</span>
                        </label>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 leading-relaxed space-y-1">
                      <p>• 수집 항목: 이메일, 문의 내용</p>
                      <p>• 이용 목적: 문의 사항 답변 및 채용 관련 안내</p>
                      <p>• 보유 기간: 문의 처리 완료 후 6개월</p>
                      <p>• 귀하는 개인정보 수집 및 이용을 거부할 권리가 있으며, 거부 시 서비스 이용이 제한됩니다.</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!isInquiryFormValid || isInquirySubmitting}
                    aria-live="polite"
                  >
                    {isInquirySubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      "제출하기"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Decline Modal */}
          <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl">감사합니다</DialogTitle>
                <DialogDescription className="sr-only">
                  팀스파르타의 다양한 협업 방식에 대한 안내와 추후 연락 가능 여부를 선택하는 화면입니다.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-base text-gray-700 leading-relaxed mb-4">시간 내어 검토해주셔서 감사합니다.</p>
                <p className="text-base text-gray-700 leading-relaxed mb-2">
                  저희 팀스파르타와의 협업은 하나의 모습만 있는 것은 아닙니다.
                </p>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  후보자님의 전문성과 스타일에 따라 훨씬 유연하고 다양한 방식으로 함께하실 수 있습니다.
                </p>
                <ul className="space-y-2 mb-4 text-base text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>콘텐츠 제작:</strong> 원하는 시간에 자유롭게 학습 콘텐츠 제작
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>성장 퍼실리테이팅:</strong> 재택근무로 수강생의 성장을 돕는 멘토링
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>실시간 강의:</strong> 열정적인 현장의 에너지를 이끄는 강의
                    </span>
                  </li>
                </ul>
                <p className="text-base text-gray-700 leading-relaxed mb-1">
                  연락처를 남겨주시면, 후보자님께 적합한 자리가 마련되었을 때,
                </p>
                <p className="text-base text-gray-700 leading-relaxed mb-6">잊지 않고 가장 먼저 연락드리겠습니다.</p>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                    <a href="https://tutorteamsparta.ninehire.site/recruit" target="_blank" rel="noopener noreferrer">
                      현재 구인 중인 포지션 확인하기
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button onClick={() => handleFollowUpResponse(true)}>연락주세요</Button>
                  <Button variant="outline" onClick={() => handleFollowUpResponse(false)}>
                    괜찮아요
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Contact Form Modal */}
          <Dialog open={showContactFormModal} onOpenChange={setShowContactFormModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">연락처 입력</DialogTitle>
                <DialogDescription className="sr-only">
                  추후 연락을 위한 이름, 이메일과 전화번호를 입력하는 폼입니다.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleContactFormSubmit} className="py-4">
                {contactErrorMessage && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex flex-col gap-2">
                      <span>{contactErrorMessage}</span>
                      <span className="text-sm">문제가 지속되면 tutor@teamsparta.co로 직접 연락주세요.</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleContactRetry}
                        className="w-fit mt-2 bg-transparent"
                      >
                        다시 시도
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">
                      이름 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={contactErrorMessage ? "true" : "false"}
                      placeholder="홍길동"
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">
                      이메일 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={contactErrorMessage ? "true" : "false"}
                      placeholder="your@email.com"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">전화번호</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={contactFormData.phone}
                      onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                      className="text-base"
                    />
                    <p className="text-sm text-gray-500">입력시 카카오톡으로 소식을 받을 수 있어요.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="contact-privacy-consent"
                        checked={contactPrivacyConsent}
                        onCheckedChange={(checked) => setContactPrivacyConsent(checked as boolean)}
                        aria-required="true"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="contact-privacy-consent"
                          className="text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          개인정보 수집 및 이용에 동의합니다 <span className="text-red-500">*</span>
                        </label>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 leading-relaxed space-y-1">
                      <p>• 수집 항목: 이름, 이메일, 전화번호</p> {/* Updated to include name */}
                      <p>• 이용 목적: 향후 채용 기회 안내</p>
                      <p>• 보유 기간: 수집일로부터 3년 (이후 자동 파기)</p>
                      <p>• 귀하는 개인정보 수집 및 이용을 거부할 권리가 있으며, 거부 시 서비스 이용이 제한됩니다.</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowContactFormModal(false)
                      setContactErrorMessage("")
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={!isContactFormValid || isContactSubmitting} aria-live="polite">
                    {isContactSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      "제출하기"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Inquiry Success Modal */}
          <Dialog open={showInquirySuccessModal} onOpenChange={handleInquiryModalClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">문의 접수 완료</DialogTitle>
                <DialogDescription className="sr-only">문의가 성공적으로 접수되었습니다.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-base text-gray-700 leading-relaxed mb-2">관심가지고 문의해주셔서 감사합니다.</p>
                <p className="text-base text-gray-700 leading-relaxed">
                  영업일 기준 5일 내로 검토하여 이메일로 회신드리겠습니다.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleInquiryModalClose}>확인</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Final Thank You Modal */}
          <Dialog open={showFinalThankYouModal} onOpenChange={handleFinalThankYouClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">감사합니다</DialogTitle>
                <DialogDescription className="sr-only">회신해주셔서 감사합니다.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-base text-gray-700 leading-relaxed">
                  회신해주셔서 감사합니다.
                  <br />
                  오늘도 좋은 하루 보내세요 :)
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleFinalThankYouClose}>확인</Button>
              </div>
            </DialogContent>
          </Dialog>

          <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
            <div className="text-xs text-gray-500 space-y-2">
              <p>팀스파르타 | 사업자등록번호: 783-86-01715</p>
              <p>
                <a
                  href="https://teamsparta.notion.site/13b7cb5097f78042b6c7f2e1b0b0c4e9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700"
                >
                  개인정보 처리방침
                </a>
                {" | "}
                <span>문의: tutor@teamsparta.co</span>
              </p>
              <p className="text-gray-400">입력하신 정보는 채용 목적으로만 사용되며, 관련 법령에 따라 보관됩니다.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
