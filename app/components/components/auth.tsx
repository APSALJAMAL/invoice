import { signIn, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { FaGoogle } from "react-icons/fa"

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider)
      }}
    >
      <Button {...props}>Sign In</Button>
    </form>
  )
}

export function SignInGoogleButton({ ...props }: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <Button {...props}>
        <FaGoogle className="mr-2" /> {/* Ícone do Google */}
        Sign in with Google
      </Button>
    </form>
  )
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
      className="w-full"
    >
      <Button variant="ghost" className="w-full p-0" {...props}>
        Sign Out
      </Button>
    </form>
  )
}