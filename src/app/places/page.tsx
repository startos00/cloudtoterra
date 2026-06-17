import { redirect } from 'next/navigation'

// The grid now lives in the unified explorer at /.
export default function PlacesPage() {
  redirect('/?view=grid')
}
