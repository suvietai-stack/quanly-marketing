import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order-quotes/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/order-quotes/$id"!</div>
}
