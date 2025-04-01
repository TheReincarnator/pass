import { FolderForm } from '@/components/FolderForm'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Entry({ params }: Props) {
  const id = parseInt((await params).slug, 10)
  return <FolderForm id={id} />
}
