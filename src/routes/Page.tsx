import { useEffect } from "react"

interface PageProps {
    title?: string
}

export const Page = ({
    children,
    title,
}: React.PropsWithChildren<PageProps>) => {
    useEffect(() => {
        document.title = `${title}` || "null"
    }, [title])
    return <>{children}</>
}
