'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ModalProviders } from '@/providers/modal-providers';
import { ChatInput, ChatInputHandles } from '@/components/thread/chat-input/chat-input';
import { useInitiateAgentMutation } from '@/hooks/react-query/dashboard/use-initiate-agent';
import { useThreadQuery } from '@/hooks/react-query/threads/use-threads';
import { normalizeFilenameToNFC } from '@/lib/utils/unicode';
import { BillingError } from '@/lib/api';
import { useModal } from '@/hooks/use-modal-store';
import { isLocalMode } from '@/lib/config';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog';
import GoogleSignIn from '@/components/GoogleSignIn';
import Link from 'next/link';

// Custom dialog overlay with blur effect
const BlurredDialogOverlay = () => (
  <DialogOverlay className="bg-black/60 backdrop-blur-md" />
);

// Waitlist form component
function WaitlistForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    task_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Frontend-only waitlist simulation
      const waitlistEntry = {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'homepage'
      };
      
      console.log('Waitlist submission:', waitlistEntry);
      
      // Save to localStorage for now
      const existingEntries = JSON.parse(localStorage.getItem('operabase_waitlist') || '[]');
      existingEntries.push(waitlistEntry);
      localStorage.setItem('operabase_waitlist', JSON.stringify(existingEntries));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSuccess();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        task_description: ''
      });
      
    } catch (error) {
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="pl-11 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-orange-500"
            required
          />
        </div>
        
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="pl-11 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-orange-500"
            required
          />
        </div>
        
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="pl-11 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-orange-500"
            required
          />
        </div>
        
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <Textarea
            placeholder="What task would you like the AI to do for you?"
            value={formData.task_description}
            onChange={(e) => setFormData(prev => ({ ...prev, task_description: e.target.value }))}
            className="pl-11 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-orange-500 min-h-[100px] resize-none"
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <ArrowRight className="h-5 w-5" />
            Join the waitlist
          </>
        )}
      </Button>
    </form>
  );
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [initiatedThreadId, setInitiatedThreadId] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { onOpen } = useModal();
  const initiateAgentMutation = useInitiateAgentMutation();
  const threadQuery = useThreadQuery(initiatedThreadId || '');
  const chatInputRef = useRef<ChatInputHandles>(null);

  // Constant for localStorage key
  const PENDING_PROMPT_KEY = 'pendingAgentPrompt';

  // Force dark theme on homepage
  useEffect(() => {
    // Add dark class to html element
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Remove on cleanup
    return () => {
      // Don't remove dark class on cleanup to avoid flashing
    };
  }, []);

  useEffect(() => {
    if (authDialogOpen && inputValue.trim()) {
      localStorage.setItem(PENDING_PROMPT_KEY, inputValue.trim());
    }
  }, [authDialogOpen, inputValue]);

  useEffect(() => {
    if (authDialogOpen && user && !isLoading) {
      setAuthDialogOpen(false);
      router.push('/dashboard');
    }
  }, [user, isLoading, authDialogOpen, router]);

  useEffect(() => {
    if (threadQuery.data && initiatedThreadId) {
      const thread = threadQuery.data;
      if (thread.project_id) {
        router.push(`/projects/${thread.project_id}/thread/${initiatedThreadId}`);
      } else {
        router.push(`/agents/${initiatedThreadId}`);
      }
      setInitiatedThreadId(null);
    }
  }, [threadQuery.data, initiatedThreadId, router]);

  const handleChatInputSubmit = async (
    message: string,
    options?: { model_name?: string; enable_thinking?: boolean }
  ) => {
    if ((!message.trim() && !chatInputRef.current?.getPendingFiles().length) || isSubmitting) return;

    // If user is not logged in, save prompt and show auth dialog
    if (!user && !isLoading) {
      localStorage.setItem(PENDING_PROMPT_KEY, message.trim());
      setAuthDialogOpen(true);
      return;
    }

    // User is logged in, create the agent
    setIsSubmitting(true);
    try {
      const files = chatInputRef.current?.getPendingFiles() || [];
      localStorage.removeItem(PENDING_PROMPT_KEY);

      const formData = new FormData();
      formData.append('prompt', message);

      if (selectedAgentId) {
        formData.append('agent_id', selectedAgentId);
      }

      files.forEach((file) => {
        const normalizedName = normalizeFilenameToNFC(file.name);
        formData.append('files', file, normalizedName);
      });

      if (options?.model_name) formData.append('model_name', options.model_name);
      formData.append('enable_thinking', String(options?.enable_thinking ?? false));
      formData.append('reasoning_effort', 'low');
      formData.append('stream', 'true');
      formData.append('enable_context_manager', 'false');

      const result = await initiateAgentMutation.mutateAsync(formData);

      if (result.thread_id) {
        setInitiatedThreadId(result.thread_id);
      } else {
        throw new Error('Agent initiation did not return a thread_id.');
      }

      chatInputRef.current?.clearPendingFiles();
      setInputValue('');
    } catch (error: any) {
      if (error instanceof BillingError) {
        onOpen("paymentRequiredDialog");
      } else {
        const isConnectionError =
          error instanceof TypeError &&
          error.message.includes('Failed to fetch');
        if (!isLocalMode() || isConnectionError) {
          toast.error(
            error.message || 'Failed to create agent. Please try again.',
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaitlistSuccess = () => {
    setWaitlistSuccess(true);
    setTimeout(() => {
      setWaitlistDialogOpen(false);
      setWaitlistSuccess(false);
    }, 3000);
  };

  return (
    <>
      <ModalProviders />
      {/* Force dark theme for homepage - override system preferences */}
      <div className="homepage-dark-theme bg-black text-white min-h-screen dark" style={{ colorScheme: 'dark' }}>
        <main className="flex flex-col items-center justify-center min-h-screen w-full">
          {/* Hero Section */}
          <section className="w-full relative overflow-hidden py-32">
            <div className="relative flex flex-col items-center w-full px-6 max-w-4xl mx-auto">
              {/* Main content */}
              <div className="relative z-10 flex flex-col gap-12 items-center justify-center text-center">
                {/* Title */}
                <div className="flex flex-col items-center justify-center gap-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                    Your new operational AI.
                  </h1>
                  <p className="text-xl md:text-2xl text-zinc-400 font-medium text-balance leading-relaxed max-w-3xl">
                    Tell it what you need. The AI understands, builds, and executes — like an assistant that works 24/7.
                  </p>
                </div>

                {/* Input */}
                <div className="w-full max-w-2xl relative">
                  <ChatInput
                    ref={chatInputRef}
                    onSubmit={handleChatInputSubmit}
                    placeholder="Describe what you need help with..."
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    value={inputValue}
                    onChange={setInputValue}
                    isLoggedIn={!!user}
                    selectedAgentId={selectedAgentId}
                    onAgentSelect={setSelectedAgentId}
                    autoFocus={false}
                    bgColor="bg-zinc-900/80 border-zinc-700"
                  />
                  
                  {/* Waitlist CTA for non-logged users */}
                  {!user && !isLoading && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => setWaitlistDialogOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <ArrowRight className="h-5 w-5" />
                        Join the waitlist
                      </Button>
                    </div>
                  )}
                </div>

                {/* Small note for existing users */}
                {!user && !isLoading && (
                  <p className="text-sm text-zinc-500">
                    <button 
                      onClick={() => setAuthDialogOpen(true)}
                      className="text-orange-400 hover:text-orange-300 underline"
                    >
                      Sign in to continue
                    </button>
                    {' '}existing users
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* What it does Section */}
          <section className="w-full py-24 bg-zinc-950/50">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  You say it. It gets done. Every day.
                </h2>
              </div>
              
              <div className="space-y-6 text-xl text-zinc-300 max-w-2xl mx-auto">
                <div className="flex flex-col gap-2">
                  <p>• Send emails? Fill spreadsheets? Collect data?</p>
                  <p>• Organize tasks? Create weekly workflows?</p>
                </div>
                
                <div className="pt-4 space-y-2">
                  <p className="text-white font-medium">All of it — with one simple request in plain language.</p>
                  <p>No blocks. No complex setups.</p>
                  <p className="text-white font-medium">Just results.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Waitlist CTA Section */}
          <section className="w-full py-24">
            <div className="max-w-2xl mx-auto px-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  We're opening access in phases.
                </h2>
              </div>
              
              <p className="text-xl text-zinc-300 mb-12">
                Join the waitlist to get notified as soon as access opens.<br />
                Some users will get early access 👀
              </p>
              
              {/* Waitlist Form */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
                <WaitlistForm onSuccess={handleWaitlistSuccess} />
              </div>
            </div>
          </section>

          {/* Minimal Footer */}
          <footer className="w-full py-12 border-t border-zinc-800">
            <div className="max-w-4xl mx-auto px-6 text-center text-zinc-500">
              <p>&copy; 2024 Operabase. All rights reserved.</p>
            </div>
          </footer>
        </main>

        {/* Auth Dialog */}
        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <BlurredDialogOverlay />
          <DialogContent className="sm:max-w-md rounded-xl bg-zinc-900 border border-zinc-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-white">
                Sign in to continue
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Sign in to talk with your AI assistant
              </DialogDescription>
            </DialogHeader>

            {/* Google Sign In */}
            <div className="w-full">
              <GoogleSignIn returnUrl="/dashboard" />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-zinc-400">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Sign in options */}
            <div className="space-y-4">
              <Link
                href={`/auth?returnUrl=${encodeURIComponent('/dashboard')}`}
                className="flex h-12 items-center justify-center w-full text-center rounded-full bg-white text-black hover:bg-zinc-100 transition-all shadow-md font-medium"
                onClick={() => setAuthDialogOpen(false)}
              >
                Sign in with email
              </Link>

              <Button
                onClick={() => {
                  setAuthDialogOpen(false);
                  setWaitlistDialogOpen(true);
                }}
                className="flex h-12 items-center justify-center w-full text-center rounded-full border border-zinc-700 bg-transparent hover:bg-zinc-800 transition-all text-white"
              >
                Join the Waitlist
              </Button>
            </div>

            <div className="mt-4 text-center text-xs text-zinc-500">
              By continuing, you agree to our{' '}
              <Link href="/legal" className="text-orange-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal" className="text-orange-400 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </DialogContent>
        </Dialog>

        {/* Waitlist Dialog */}
        <Dialog open={waitlistDialogOpen} onOpenChange={setWaitlistDialogOpen}>
          <BlurredDialogOverlay />
          <DialogContent className="sm:max-w-md rounded-xl bg-zinc-900 border border-zinc-700 text-white">
            {waitlistSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Thank you!</h3>
                <p className="text-zinc-400">We'll notify you as soon as access opens.</p>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-medium text-white">
                    Join the Waitlist
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Get early access to your new operational AI
                  </DialogDescription>
                </DialogHeader>
                
                <WaitlistForm onSuccess={handleWaitlistSuccess} />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
