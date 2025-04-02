import { FolderForm } from '@/components/FolderForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function Entry({ params }: Props) {
  const id = parseInt((await params).id, 10)
  return <FolderForm id={id} />
}
