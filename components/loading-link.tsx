"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ComponentProps, MouseEvent } from "react"
import { useLoading } from "./loading-provider"

type LoadingLinkProps = ComponentProps<typeof Link>

export function LoadingLink({ href, onClick, ...props }: LoadingLinkProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    onClick?.(e)

    // Don't show loader for same page or hash links
    if (e.defaultPrevented) return
    
    const url = href.toString()
    if (url.startsWith('#')) return

    // Show loader
    startLoading()

    // Navigate
    e.preventDefault()
    router.push(url)

    // Hide loader after navigation (fallback)
    setTimeout(() => {
      stopLoading()
    }, 3000)
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
