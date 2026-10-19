import React from 'react';
import { ShieldCheck, Fingerprint, Key, RefreshCcw, CheckCircle2 } from 'lucide-react';

export const SecurityTips: React.FC = () => {
  const tips = [
    {
      icon: <Fingerprint className="w-5 h-5 text-[#00E5FF]" />,
      title: 'Upgrade to Passkeys (FIDO2 / WebAuthn)',
      tag: 'NEXT-GEN AUTH',
      content:
        'Passkeys replace passwords entirely using public-key cryptography. Because private keys never leave your physical device and domain-bound authentication prevents phishing, passkeys are mathematically immune to credential stuffing, phishing proxies, and database leaks.',
    },
    {
      icon: <Key className="w-5 h-5 text-[#C6FF3D]" />,
      title: 'Adopt Zero-Knowledge Password Vaults',
      tag: 'DAILY HYGIENE',
      content:
        'Never reuse master passwords across accounts. Use end-to-end encrypted password vaults (e.g. 1Password, Bitwarden, KeePassXC) with Argon2id key derivation and secure biometric unlocks.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#7C5CFF]" />,
      title: 'Enforce Hardware-Bound Multi-Factor (MFA)',
      tag: 'PHISHING DEFENSE',
      content:
        'SMS and email verification codes are vulnerable to SIM swapping and adversary-in-the-middle phishing kits. Always prefer hardware security keys (FIDO2 YubiKey) or time-based authenticator apps (TOTP).',
    },
    {
      icon: <RefreshCcw className="w-5 h-5 text-[#FFB800]" />,
      title: 'The Truth About Password Expiration',
      tag: 'NIST SP 800-63B',
      content:
        'Arbitrary 90-day password change policies harm security by encouraging predictable increments (e.g. "Spring2025!" to "Summer2025!"). NIST guidelines recommend changing passwords only when a breach is verified or suspected.',
    },
  ];

  const checklist = [
    'Length over complexity: 16+ characters beats a short complex string every time.',
    'Unique credentials everywhere: One compromised site should never cascade to your banking or email.',
    'Protect primary email like Fort Knox: Your email is the recovery root for all accounts.',
    'Audit shared logins: Revoke legacy API tokens and forgotten third-party OAuth app permissions.',
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-mono text-[#00E5FF]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SECURITY.HYGIENE // NIST SP 800-63B</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#F4F5F7]">
          Defense in Depth Best Practices
        </h2>
        <p className="text-sm text-[#8E92A0]">
          Essential guidelines curated from NIST Special Publication 800-63B and modern zero-trust enterprise security postures.
        </p>
      </div>

      {/* Grid of Tip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, idx) => (
          <div key={idx} className="p-6 rounded-3xl glass-panel space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#0A0B0F] border border-white/10 flex items-center justify-center">
                  {tip.icon}
                </div>
                <span className="text-[10px] font-mono text-[#8E92A0] px-2 py-0.5 rounded bg-white/5 border border-white/5">
                  {tip.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#F4F5F7] font-heading">{tip.title}</h3>
              <p className="text-xs text-[#8E92A0] leading-relaxed">{tip.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Checklist Card */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border-[#C6FF3D]/25 space-y-4">
        <h3 className="text-base font-semibold text-[#F4F5F7] font-heading flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
          Defense in Depth Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0A0B0F] border border-white/5 text-xs text-[#F4F5F7]/90">
              <CheckCircle2 className="w-4 h-4 text-[#C6FF3D] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
