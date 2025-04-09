'use client'

import classNames from 'classnames'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { create } from 'zustand'

type Props = PropsWithChildren<{
  type: 'info' | 'warning' | 'question' | 'critical'
  title: string
  closeIcon?: boolean
  okButton?: string
  cancelButton?: string
  onCloseIcon?: () => void
  onOkButton?: () => void
  onCancelButton?: () => void
}>

export function Dialog({
  type,
  title,
  closeIcon,
  okButton,
  cancelButton,
  onCloseIcon,
  onOkButton,
  onCancelButton,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  let titleIcon
  let critical
  switch (type) {
    case 'warning':
      titleIcon = 'exclamation-triangle'
      critical = true
      break

    case 'question':
      titleIcon = 'question-circle'
      critical = false
      break

    case 'critical':
      titleIcon = 'question-circle'
      critical = true
      break

    default:
      titleIcon = 'info-circle'
      critical = false
  }

  return mounted
    ? createPortal(
        <>
          <div className="overlay-shim" style={{ opacity: 1 }}></div>

          <div className="overlay" style={{ opacity: 1 }}>
            <div className="overlay__frame">
              {closeIcon && (
                <div className="overlay__frame__close">
                  <Button
                    type="button"
                    leftIcon="close"
                    onClick={onCloseIcon}
                    variant="secondary"
                  />
                </div>
              )}

              <div className="overlay__frame__bar">
                <h2>
                  <span>
                    <i
                      className={classNames(
                        'overlay__frame__bar__icon',
                        { 'overlay__frame__bar__icon--critical': critical },
                        'fa',
                        `fa-${titleIcon}`,
                      )}
                    />
                  </span>

                  <span>{title}</span>
                </h2>
              </div>

              <div className="overlay__frame__content page-content">{children}</div>

              <div className="overlay__frame__bar overlay__frame__bar--right">
                <Button
                  type="button"
                  variant="secondary"
                  text={okButton || 'OK'}
                  onClick={onOkButton}
                />

                {cancelButton && (
                  <Button
                    type="button"
                    variant="secondary"
                    text={cancelButton}
                    onClick={onCancelButton}
                  />
                )}
              </div>
            </div>
          </div>
        </>,
        document.body,
      )
    : null
}

type MessageDialogState = Omit<Props, 'children'> & { message: string }

type MessageDialogStore = {
  state: MessageDialogState | null
  setState: (newState: MessageDialogState) => void
}

const useMessageDialogState = create<MessageDialogStore>((set, get) => ({
  state: null,
  setState: (newState: MessageDialogState) => set({ state: newState }),
}))

export function MessageDialog() {
  const { state } = useMessageDialogState((state) => state)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return mounted && state ? (
    <Dialog
      type={state.type}
      title={state.title}
      closeIcon={state.closeIcon}
      okButton={state.okButton}
      cancelButton={state.cancelButton}
    >
      {state.message}
    </Dialog>
  ) : null
}

export function useMessageDialog() {
  const { state, setState } = useMessageDialogState((state) => state)

  const messageDialog = async ({
    title,
    message,
    okButton,
  }: {
    title: string
    message: string
    okButton?: string
  }): Promise<void> => {
    const onCloseIcon = () => {}
    const onCancelButton = () => {}
    const onOkButton = () => {}

    setState({
      type: 'info',
      title,
      closeIcon: true,
      message,
      okButton,
      onCloseIcon,
      onCancelButton,
      onOkButton,
    })
  }

  return messageDialog
}
