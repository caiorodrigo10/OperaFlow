import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, ExternalLink } from 'lucide-react';
import { KortixProcessModal } from '@/components/sidebar/kortix-enterprise-modal';

export function CTACard() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-200 dark:from-orange-950/40 dark:to-orange-900/40 shadow-sm border border-orange-200/50 dark:border-orange-800/50 p-4 transition-all">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Enterprise Demo
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">
            AI employees for your company
          </span>
        </div>

        <div>
          <KortixProcessModal />
        </div>

        <div className="flex items-center pt-1 border-t border-orange-200/50 dark:border-orange-800/30 mt-1">
          <Link
            href="https://www.kortix.ai/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
          >
            <Briefcase className="mr-1.5 h-3.5 w-3.5" />
            Join Our Team! 🚀
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
