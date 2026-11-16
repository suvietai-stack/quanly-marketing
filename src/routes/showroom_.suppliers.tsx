import { createFileRoute, redirect } from '@tanstack/react-router';

// Historical entrypoint: suppliers are now a single global master in Procurement.
export const Route = createFileRoute('/showroom_/suppliers')({
  beforeLoad: () => { throw redirect({to:'/procurement/suppliers'}); },
  component: () => null,
});
