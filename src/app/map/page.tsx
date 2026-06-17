import { redirect } from 'next/navigation'

// The map now lives in the unified explorer at /.
export default function MapPage() {
  redirect('/?view=map')
}
