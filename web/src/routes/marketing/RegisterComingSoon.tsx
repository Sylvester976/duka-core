import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function RegisterComingSoon() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 text-text">
      <Card className="w-full max-w-sm p-8 text-center">
        <p className="font-semibold text-lg">duka-core</p>
        <h1 className="mt-4 font-semibold text-xl">Self-serve signup is launching soon</h1>
        <p className="mt-2 text-sm text-text-muted">
          We're putting the finishing touches on instant registration. In the meantime, get in
          touch and we'll set your business up personally.
        </p>

        <Link to="/" className="mt-6 block">
          <Button className="w-full">Back to home</Button>
        </Link>
      </Card>
    </div>
  )
}
