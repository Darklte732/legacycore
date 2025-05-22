import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Attachments | Agent Portal",
}

export default function AttachmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 