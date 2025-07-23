import React from 'react';
import { SidebarTrigger, Separator } from '@docujourney/ui';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // These props are only available in the page, so we use a prop-drilling pattern for ProfileSwitcher
  // You will need to pass profiles, initialProfileId, and userId from the page to the layout via props or context if needed.
  // For now, we use searchParams for profileId and expect userId/profile data to be fetched in the page and passed as props.
  // This layout is for structure only; header content is static except for ProfileSwitcher.
  // You may want to refactor to use context for user/profile data if needed across documents pages.
  return (
    <>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Documents</h1>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </div>
      </div>
    </>
  );
}
