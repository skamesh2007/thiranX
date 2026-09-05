import {useRouter} from "next/navigation"
import { Settings2 } from "lucide-react"

export default function ManageLink() {
  const router = useRouter();
  return (
    <div className="flex justify-center">
      <button
        onClick={() => router.push("/profile/edit")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Change linked account in Edit Profile
      </button>
    </div>
  )
}
