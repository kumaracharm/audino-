"use client";

import React, { useState, useEffect, useRef } from 'react';
import { UserSession, DailyCheckin, Patient } from '@/types';
import { MinecraftAvatar } from '../common/MinecraftAvatar';
import { 
  Heart, 
  Wind, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Mic, 
  MicOff, 
  Volume2, 
  AlertCircle, 
  Calendar, 
  Pill, 
  PhoneCall, 
  LogOut, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  BatteryCharging,
  Wifi,
  ChevronRight
} from 'lucide-react';

interface PatientPortalViewProps {
  user: UserSession;
  patient: Patient;
  onLogout: () => void;
  onCheckinSubmitted: (checkin: DailyCheckin) => void;
  recentCheckins: DailyCheckin[];
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  user,
  patient,
  onLogout,
  onCheckinSubmitted,
  recentCheckins,
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'vitals_wave' | 'calendar' | 'medications'>('checkin');
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [adaptiveBranch, setAdaptiveBranch] = useState<boolean>(false);
  const [voiceNote, setVoiceNote] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const [checkinCompleteToday, setCheckinCompleteToday] = useState<boolean>(false);
  const [wavePoints, setWavePoints] = useState<{ time: string; hr: number; spo2: number }[]>([]);

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceFeedback('Listening... Please speak your answer.');
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          handleVoiceInput(text);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setVoiceFeedback('Microphone unavailable or speech not recognized.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [wizardStep]);

  // Live Waveform Stream Simulation (Sampling every 2.5 seconds)
  useEffect(() => {
    // Generate initial 20 points
    const now = Date.now();
    const initial = Array.from({ length: 18 }, (_, i) => {
      const t = new Date(now - (18 - i) * 3000);
      return {
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        hr: Math.round(patient.currentVitals.heartRate + (Math.sin(i) * 4)),
        spo2: Math.round(patient.currentVitals.spo2 + (Math.cos(i) * 1)),
      };
    });
    setWavePoints(initial);

    const interval = setInterval(() => {
      const t = new Date();
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setWavePoints((prev) => [
        ...prev.slice(1),
        {
          time: timeStr,
          hr: Math.round(patient.currentVitals.heartRate + (Math.random() - 0.5) * 5),
          spo2: Math.round(Math.min(100, Math.max(88, patient.currentVitals.spo2 + (Math.random() - 0.5) * 1.5))),
        },
      ]);
    }, 2500);

    return () => clearInterval(interval);
  }, [patient.currentVitals]);

  // Read Question Aloud
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      const promptText = prompt('Speech recognition unavailable. Type your response:');
      if (promptText) handleVoiceInput(promptText);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Process Voice Input into Answers
  const handleVoiceInput = (speechText: string) => {
    setVoiceFeedback(`Heard: "${speechText}"`);
    const lower = speechText.toLowerCase();

    if (wizardStep === 0) {
      if (lower.includes('great')) selectAnswer('feeling', 'great');
      else if (lower.includes('good') || lower.includes('fine')) selectAnswer('feeling', 'good');
      else if (lower.includes('fair') || lower.includes('tired')) selectAnswer('feeling', 'fair');
      else if (lower.includes('sick') || lower.includes('bad') || lower.includes('unwell')) selectAnswer('feeling', 'unwell');
      else selectAnswer('feeling', 'good');
    } else if (wizardStep === 1) {
      if (lower.includes('no') || lower.includes('none') || lower.includes('fine')) selectAnswer('breathing', 'none');
      else if (lower.includes('mild') || lower.includes('slight')) selectAnswer('breathing', 'mild');
      else if (lower.includes('severe') || lower.includes('hard') || lower.includes('bad')) selectAnswer('breathing', 'severe');
    } else if (wizardStep === 2) {
      if (lower.includes('no') || lower.includes('normal')) selectAnswer('fatigue', 'none');
      else if (lower.includes('tired') || lower.includes('mild')) selectAnswer('fatigue', 'mild');
      else selectAnswer('fatigue', 'severe');
    } else if (wizardStep === 3) {
      if (lower.includes('no') || lower.includes('none')) selectAnswer('fever', 'none');
      else selectAnswer('fever', 'mild');
    } else if (wizardStep === 4) {
      if (lower.includes('yes') || lower.includes('all') || lower.includes('taken')) selectAnswer('medications', 'yes_all');
      else selectAnswer('medications', 'not_yet');
    } else {
      // Voice symptom note
      setVoiceNote((prev) => (prev ? `${prev} ${speechText}` : speechText));
    }
  };

  const selectAnswer = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (key === 'breathing' && (value === 'mild' || value === 'severe')) {
      setAdaptiveBranch(true);
    }
  };

  // Submit Check-in
  const handleSubmitCheckin = () => {
    let score = 0;
    if (answers.feeling === 'unwell') score += 2;
    if (answers.breathing === 'mild') score += 2;
    if (answers.breathing === 'severe') score += 5;
    if (answers.fatigue === 'severe') score += 3;
    if (answers.fever === 'mild') score += 2;
    if (answers.medications === 'partial' || answers.medications === 'skipped') score += 2;
    if (answers.adaptiveOnset === 'last_hour') score += 3;

    const riskTier = score >= 6 ? 'CRITICAL' : (score >= 3 ? 'HIGH' : (score >= 1 ? 'MODERATE' : 'LOW'));

    const now = new Date();
    const newCheckin: DailyCheckin = {
      id: `CHK-${Date.now()}`,
      patientId: patient.id,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      feeling: answers.feeling || 'Good',
      breathing: answers.breathing || 'None',
      fatigue: answers.fatigue || 'Normal',
      fever: answers.fever || 'None',
      medications: answers.medications || 'Taken',
      symptoms: answers.symptoms || ['None'],
      adaptiveDetails: adaptiveBranch ? {
        onset: answers.adaptiveOnset || 'Earlier today',
        progression: answers.adaptiveProgression || 'Stable',
        impact: answers.adaptiveImpact || 'Mild',
      } : undefined,
      voiceNoteTranscript: voiceNote || undefined,
      riskScore: score,
      riskTier,
    };

        try {
      fetch('/api/checkins/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCheckin),
      }).catch((err) => console.warn('Backend checkin API sync:', err));
    } catch (e) {
      console.warn('API fetch error:', e);
    }

    onCheckinSubmitted(newCheckin);
    setCheckinCompleteToday(true);
    setActiveTab('vitals_wave');
  };

  // Questions Configuration
  const questions = [
    {
      id: 'feeling',
      title: 'How are you feeling today overall?',
      helper: 'Select the option that matches your morning energy and comfort.',
      options: [
        { value: 'great', label: 'Great & Energetic', icon: '😊' },
        { value: 'good', label: 'Good / Stable', icon: '🙂' },
        { value: 'fair', label: 'Fair / A bit tired', icon: '😐' },
        { value: 'unwell', label: 'Unwell or Discomfort', icon: '😟' },
      ],
    },
    {
      id: 'breathing',
      title: 'Are you having any breathing difficulty or shortness of breath?',
      helper: 'Notice your breathing while resting or speaking.',
      options: [
        { value: 'none', label: 'No breathing trouble', icon: '🫁' },
        { value: 'mild', label: 'Mild shortness of breath with walking', icon: '😮‍💨' },
        { value: 'severe', label: 'Severe breathlessness even resting', icon: '⚠️' },
      ],
    },
    {
      id: 'fatigue',
      title: 'Are you feeling unusually weak or exhausted today?',
      helper: 'Compared to your typical energy since hospital discharge.',
      options: [
        { value: 'none', label: 'Normal energy levels', icon: '⚡' },
        { value: 'mild', label: 'Mild fatigue, manageable', icon: '🥱' },
        { value: 'severe', label: 'Severe exhaustion, bedbound', icon: '🛌' },
      ],
    },
    {
      id: 'fever',
      title: 'Do you feel feverish or have shivering chills?',
      helper: 'Your wearable also checks skin temperature trends.',
      options: [
        { value: 'none', label: 'No fever or chills', icon: '🌡️' },
        { value: 'mild', label: 'Slight feverish feeling', icon: '🤒' },
      ],
    },
    {
      id: 'medications',
      title: 'Have you taken your prescribed medications today?',
      helper: 'Lisinopril 10mg, Amlodipine 2.5mg, Furosemide 40mg',
      options: [
        { value: 'yes_all', label: 'Yes, took all scheduled doses', icon: '💊' },
        { value: 'partial', label: 'Partially taken (missed one)', icon: '⏳' },
        { value: 'not_yet', label: 'Not yet, taking shortly', icon: '🕒' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0f172a] flex flex-col">
      {/* Top Mobile-First Header Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-5 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <MinecraftAvatar patientId={patient.id} size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#0f172a]">{user.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-[10px] font-bold">
                PATIENT PORTAL
              </span>
            </div>
            <div className="text-[11px] text-[#64748b]">
              ID: <span className="font-mono font-semibold">{patient.id}</span> • Ward A Tele-Recovery
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Nurse Assistance */}
          <button 
            onClick={() => alert('Assigned Nurse Sarah Jenkins, RN notified. Emergency desk phone: +1-555-0301')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] text-xs font-bold hover:bg-[#d1fae5] transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Nurse</span>
          </button>

          {/* Secure Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-[#E2E8F0] px-5 flex gap-6 text-xs font-semibold select-none overflow-x-auto">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'checkin'
              ? 'border-[#0284c7] text-[#0284c7] font-bold'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Daily Health Check-in</span>
          {!checkinCompleteToday && (
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('vitals_wave')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'vitals_wave'
              ? 'border-[#0284c7] text-[#0284c7] font-bold'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Live Waveform & Wearable</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0284c7] text-[#0284c7] font-bold'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>14-Day Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'medications'
              ? 'border-[#0284c7] text-[#0284c7] font-bold'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>My Medications</span>
        </button>
      </div>

      {/* Main Content View */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* ========================================================= */}
        {/* TAB 1: DAILY HEALTH CHECK-IN WIZARD WITH VOICE CHAT */}
        {/* ========================================================= */}
        {activeTab === 'checkin' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-6">
            {checkinCompleteToday ? (
              <div className="text-center py-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-2 border-[#10b981] flex items-center justify-center text-[#10b981]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#065f46]">Today's Health Check-in Complete</h2>
                  <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
                    Thank you, {user.name.split(' ')[0]}. Your symptom updates and connected wearable vitals have been sent to Nurse Sarah Jenkins.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 w-full max-w-md text-xs text-left space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Completion Timestamp:</span>
                    <strong className="font-mono">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Overall Status:</span>
                    <strong className="text-[#059669]">Stable Recovery</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Connected Telemetry:</span>
                    <strong className="text-[#0284c7]">PulseWatch Pro (Live)</strong>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setActiveTab('vitals_wave')}
                    className="px-5 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0369a1] transition-all cursor-pointer"
                  >
                    View Check-in Along Vitals Wave &rarr;
                  </button>
                  <button
                    onClick={() => setCheckinCompleteToday(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] text-xs font-semibold hover:bg-[#E2E8F0] transition-all cursor-pointer"
                  >
                    Edit / Redo
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Check-in Progress Bar */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#0284c7]">
                    STEP {wizardStep + 1} OF {questions.length + (adaptiveBranch ? 1 : 0)}
                  </span>
                  <span className="text-[#64748b]">Takes ~2 minutes</span>
                </div>
                <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-[#0284c7] transition-all duration-300"
                    style={{ width: `${Math.round(((wizardStep + 1) / (questions.length + (adaptiveBranch ? 1 : 0))) * 100)}%` }}
                  />
                </div>

                {/* Question Screen */}
                {wizardStep < questions.length ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#0f172a]">
                          {questions[wizardStep].title}
                        </h2>
                        <p className="text-xs text-[#64748b] mt-1">
                          {questions[wizardStep].helper}
                        </p>
                      </div>

                      {/* Read Aloud Audio Button */}
                      <button
                        onClick={() => speakText(questions[wizardStep].title)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] text-xs font-semibold hover:bg-[#e0f2fe] flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Read question aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Read Aloud</span>
                      </button>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {questions[wizardStep].options.map((opt) => {
                        const qKey = questions[wizardStep].id;
                        const isSelected = answers[qKey] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => selectAnswer(qKey, opt.value)}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-bold shadow-xs'
                                : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#cbd5e1]'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="text-sm">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* DEDICATED VOICE CHAT / SPEECH-TO-TEXT FOR PATIENT CHECK-IN */}
                    <div className="mt-4 pt-4 border-t border-[#F1F5F9] bg-[#F8FAFC] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleListening}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isListening
                              ? 'bg-[#ef4444] text-white shadow-md'
                              : 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
                          }`}
                          title="Speak answer hands-free"
                        >
                          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-[#0f172a]">
                            {isListening ? 'Listening to your voice...' : 'Voice Assistant Available'}
                          </div>
                          <div className="text-[11px] text-[#64748b]">
                            {voiceFeedback || 'Tap mic to speak your response hands-free'}
                          </div>
                        </div>
                      </div>

                      {/* Optional Voice Note text box */}
                      <input
                        type="text"
                        value={voiceNote}
                        onChange={(e) => setVoiceNote(e.target.value)}
                        placeholder="Or speak/type a symptom note..."
                        className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs"
                      />
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex justify-between items-center mt-4 pt-2">
                      <button
                        onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))}
                        disabled={wizardStep === 0}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${
                          wizardStep === 0
                            ? 'opacity-30 cursor-not-allowed'
                            : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] cursor-pointer'
                        }`}
                      >
                        Back
                      </button>

                      <button
                        onClick={() => {
                          const currentQKey = questions[wizardStep].id;
                          if (!answers[currentQKey]) {
                            alert('Please select an option or use voice input to continue.');
                            return;
                          }
                          setWizardStep((prev) => prev + 1);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0369a1] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : adaptiveBranch ? (
                  /* Adaptive Branching Follow-up Questions */
                  <div className="flex flex-col gap-4">
                    <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-xs text-[#92400e] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#d97706]" />
                      <span>
                        <strong>Clinical Follow-up:</strong> You reported breathing difficulty. Please answer two brief timing questions for your doctor.
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0f172a]">When did your shortness of breath start?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                        {['Within last hour', 'Earlier today', 'Past 1–2 days'].map((timeOpt) => (
                          <button
                            key={timeOpt}
                            onClick={() => selectAnswer('adaptiveOnset', timeOpt)}
                            className={`p-3 rounded-xl border text-xs font-semibold text-center cursor-pointer ${
                              answers.adaptiveOnset === timeOpt
                                ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-bold'
                                : 'border-[#E2E8F0] bg-white hover:border-[#cbd5e1]'
                            }`}
                          >
                            {timeOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2">
                      <h3 className="text-base font-bold text-[#0f172a]">Is it worse while you are sitting or resting?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                        {['Yes, hard to breathe while resting', 'No, only when walking'].map((progOpt) => (
                          <button
                            key={progOpt}
                            onClick={() => selectAnswer('adaptiveProgression', progOpt)}
                            className={`p-3 rounded-xl border text-xs font-semibold text-center cursor-pointer ${
                              answers.adaptiveProgression === progOpt
                                ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-bold'
                                : 'border-[#E2E8F0] bg-white hover:border-[#cbd5e1]'
                            }`}
                          >
                            {progOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setWizardStep(questions.length - 1)}
                        className="px-4 py-2 rounded-xl bg-[#F1F5F9] text-[#475569] text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitCheckin}
                        className="px-6 py-2.5 rounded-xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#13735B] transition-all cursor-pointer shadow-xs"
                      >
                        Submit Daily Check-in &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Review & Confirmation Screen */
                  <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-[#0f172a]">Review & Confirm Your Daily Check-in</h2>
                    <p className="text-xs text-[#64748b]">
                      Please review your answers. These will be logged alongside your continuous wearable waveform.
                    </p>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Overall feeling:</span>
                        <strong className="capitalize">{answers.feeling}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Breathing:</span>
                        <strong className="capitalize">{answers.breathing}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Fatigue:</span>
                        <strong className="capitalize">{answers.fatigue}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Medication taken:</span>
                        <strong className="capitalize">{answers.medications}</strong>
                      </div>
                      {voiceNote && (
                        <div className="border-t border-[#E2E8F0] pt-2 mt-2">
                          <span className="text-[#64748b]">Voice Note:</span>
                          <p className="font-mono text-[#0284c7] mt-0.5">"{voiceNote}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <button
                        onClick={() => setWizardStep(questions.length - 1)}
                        className="px-4 py-2 rounded-xl bg-[#F1F5F9] text-[#475569] text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitCheckin}
                        className="px-6 py-2.5 rounded-xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#13735B] transition-all cursor-pointer shadow-xs"
                      >
                        Confirm & Save to Waveform &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LIVE WEARABLE WAVEFORM WITH CHECK-IN DATA OVERLAY */}
        {/* ========================================================= */}
        {activeTab === 'vitals_wave' && (
          <div className="flex flex-col gap-5">
            {/* Wearable Connection Header */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">PulseWatch Pro Sensor Telemetry</h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748b] mt-0.5">
                    <span className="flex items-center gap-1 text-[#059669] font-semibold">
                      <Wifi className="w-3.5 h-3.5" /> 98% BLE Signal
                    </span>
                    <span className="flex items-center gap-1 text-[#0284c7] font-semibold">
                      <BatteryCharging className="w-3.5 h-3.5" /> 84% Battery
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-xs font-mono">
                <div className="bg-[#f0f9ff] px-3 py-1.5 rounded-lg border border-[#bae6fd]">
                  <span className="text-[#0369a1] text-[10px] block">LIVE HR</span>
                  <strong className="text-base text-[#0284c7]">{patient.currentVitals.heartRate} bpm</strong>
                </div>
                <div className="bg-[#ecfdf5] px-3 py-1.5 rounded-lg border border-[#a7f3d0]">
                  <span className="text-[#047857] text-[10px] block">LIVE SpO₂</span>
                  <strong className="text-base text-[#059669]">{patient.currentVitals.spo2}%</strong>
                </div>
              </div>
            </div>

            {/* CONTINUOUS VITAL WAVEFORM WITH CHECK-IN DATA MARKERS "ALONG THE WAVE" */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                    <span>Continuous Physiological Wave & Collected Check-in Points</span>
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Patient daily check-in symptom markers plotted directly along the continuous telemetry timeline.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" /> Heart Rate (bpm)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> SpO₂ (%)
                  </span>
                </div>
              </div>

              {/* SVG Live Waveform Canvas */}
              <div className="relative bg-[#090d16] rounded-xl p-4 h-48 border border-[#1e293b] flex items-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="3,3" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#1e293b" strokeDasharray="3,3" />

                  {/* Heart Rate Wave Line (Blue) */}
                  <path
                    d={wavePoints.reduce((acc, p, idx) => {
                      const x = (idx / Math.max(1, wavePoints.length - 1)) * 600;
                      const y = 110 - ((p.hr - 50) / 100) * 100;
                      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />

                  {/* SpO2 Wave Line (Emerald) */}
                  <path
                    d={wavePoints.reduce((acc, p, idx) => {
                      const x = (idx / Math.max(1, wavePoints.length - 1)) * 600;
                      const y = 110 - ((p.spo2 - 80) / 25) * 80;
                      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />

                  {/* COLLECTED CHECK-IN EVENT MARKERS "ALONG THE WAVE" */}
                  {recentCheckins.map((chk, idx) => {
                    const markerX = 150 + (idx * 160);
                    return (
                      <g key={chk.id}>
                        {/* Vertical Indicator Needle */}
                        <line x1={markerX} y1="0" x2={markerX} y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" />
                        <circle cx={markerX} cy="35" r="4.5" fill="#f59e0b" />
                        <rect x={markerX - 45} y="4" width="90" height="20" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                        <text x={markerX} y="17" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                          Check-in: {chk.timeFormatted}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Collected Check-in History Cards Along the Wave */}
              <div className="mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                  COLLECTED PATIENT CHECK-IN RECORDS ALONG STREAM
                </h4>

                {recentCheckins.length === 0 ? (
                  <p className="text-xs text-[#94a3b8] italic">No check-in submissions collected yet today.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentCheckins.map((chk) => (
                      <div
                        key={chk.id}
                        className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0f172a] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                            {chk.date} at {chk.timeFormatted}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            chk.riskTier === 'CRITICAL' || chk.riskTier === 'HIGH'
                              ? 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]'
                              : 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                          }`}>
                            {chk.riskTier} RISK ({chk.riskScore} pts)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#475569]">
                          <div>Feeling: <strong>{chk.feeling}</strong></div>
                          <div>Breathing: <strong>{chk.breathing}</strong></div>
                          <div>Medications: <strong>{chk.medications}</strong></div>
                          <div>Fatigue: <strong>{chk.fatigue}</strong></div>
                        </div>

                        {chk.voiceNoteTranscript && (
                          <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#0284c7] font-mono text-[11px]">
                            🎤 "{chk.voiceNoteTranscript}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 14-DAY CALENDAR */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">14-Day Check-in Adherence Calendar</h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Past check-in compliance and follow-up tracking for post-discharge recovery.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 mt-2">
              {Array.from({ length: 14 }, (_, i) => {
                const date = new Date(Date.now() - (13 - i) * 86400000);
                const dayNum = date.getDate();
                const isToday = i === 13;
                const status = isToday
                  ? (checkinCompleteToday ? 'completed' : 'pending')
                  : (i % 5 === 0 ? 'missed' : 'completed');

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 ${
                      status === 'completed'
                        ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                        : status === 'missed'
                        ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                        : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString([], { weekday: 'short' })}</span>
                    <span className="text-lg font-extrabold">{dayNum}</span>
                    <span className="text-[10px] font-semibold">
                      {status === 'completed' ? '✓ Done' : (status === 'missed' ? 'Missed' : 'Today')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MY MEDICATIONS */}
        {/* ========================================================= */}
        {activeTab === 'medications' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">Active Prescribed Medications</h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Discharge prescription regimen verified by Dr. Arthur Chen, MD.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {[
                { name: 'Lisinopril', dose: '10 mg Oral Tablet', schedule: 'Once daily in the morning', reason: 'Blood pressure & heart function' },
                { name: 'Amlodipine', dose: '2.5 mg Oral Tablet', schedule: 'Once daily with food', reason: 'Vascular stabilization' },
                { name: 'Furosemide', dose: '40 mg Oral Tablet', schedule: 'Once daily before noon', reason: 'Fluid retention prevention' },
              ].map((med) => (
                <div key={med.name} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a]">{med.name} — {med.dose}</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">{med.schedule} • {med.reason}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669] text-xs font-bold border border-[#a7f3d0]">
                    ✓ Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
