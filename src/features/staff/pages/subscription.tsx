const Subscription = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,58,95,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef4fb_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#1E3A5F] via-[#4F7CAC] to-[#D9B44A]" />

          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-between px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="space-y-6">
                <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
                  Subscription expired
                </span>

                <div className="space-y-4">
                  <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-[#0F1E33] sm:text-4xl">
                    Access is temporarily limited until the subscription is
                    renewed.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Your account is currently in read-only notice mode because
                    the subscription has expired. Since you are not responsible
                    for renewal, please contact your admin so they can review
                    and renew access.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      What to do next
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Share this notice with your admin and ask them to renew
                      the plan for your staff account.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Why you see this
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Only the designated account owner or administrator can
                      manage the subscription status.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
                <a
                  href="mailto:admin@school.org"
                  className="inline-flex items-center justify-center rounded-full bg-[#1E3A5F] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#17304d]"
                >
                  Contact admin
                </a>
                <p className="text-sm text-slate-500">
                  If your admin has already renewed the subscription, refresh
                  the page after a short moment.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-8 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
              <div className="flex h-full flex-col justify-between gap-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Notice
                  </p>
                  <div className="mt-4 space-y-4">
                    <p className="text-lg font-semibold text-[#0F1E33]">
                      Subscription renewal required
                    </p>
                    <p className="text-sm leading-7 text-slate-600">
                      This page appears only when the subscription has expired
                      and the current staff member does not have permission to
                      renew it.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl bg-[#F4F7FB] p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Helpful details
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-slate-600">
                    <li>• Admins can confirm the subscription status.</li>
                    <li>
                      • Renewal restores normal access for the staff account.
                    </li>
                    <li>
                      • No action is needed from the staff user beyond notifying
                      admin.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600">
                  Need to pass along the notice? Send the admin this message:
                  <span className="mt-2 block font-medium text-slate-900">
                    “My staff account is showing a subscription expiry notice.
                    Please review and renew the subscription.”
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
