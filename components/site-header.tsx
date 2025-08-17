import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ArrowUpRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Admin Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size={'lg'}>
            <Link
              href={process.env.NEXT_PUBLIC_BASE_URL || ""}
              rel="noopener noreferrer"
              target="_blank"
            >
              Return to Site
              <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
