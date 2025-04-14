import { EntryForm } from '@/components/EntryForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function Entry({ params }: Props) {
  const id = parseInt((await params).id, 10) || null
  return <EntryForm id={id} />
}
