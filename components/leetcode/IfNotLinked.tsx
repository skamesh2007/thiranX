import { SiLeetcode } from "react-icons/si" 
import { useRouter } from "next/navigation"
import { Settings2 } from "lucide-react"

export default function IfNotLinked() { 


    const router = useRouter();

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4 text-center sm:p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20">
          <SiLeetcode className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl">LeetCode not connected</h1>
          <p className="text-sm text-muted-foreground">
            Link your LeetCode account to track your progress here.
          </p>
        </div>

        <button
          onClick={() => router.push("/profile/edit")}
          className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Settings2 className="h-4 w-4" />
          Connect in Edit Profile
        </button>
      </div>
    )
}