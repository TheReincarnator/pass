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
  onOk?: () => void
  onCancel?: () => void
}>

export function Dialog({
  type,
  title,
  closeIcon,
  okButton,
  cancelButton,
  onOk,
  onCancel,
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
                  <Button type="button" leftIcon="close" onClick={onCancel} variant="secondary" />
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
                <Button type="button" text={okButton || 'OK'} onClick={onOk} />

                {cancelButton && (
                  <Button
                    type="button"
                    variant="secondary"
                    text={cancelButton}
                    className="ml-2"
                    onClick={onCancel}
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

type SimpleDialogState = (Omit<Props, 'children'> & { message: string }) | null

type SimpleDialogStore = {
  state: SimpleDialogState
  setState: (newState: SimpleDialogState) => void
}

const useSimpleDialogState = create<SimpleDialogStore>((set) => ({
  state: null,
  setState: (newState: SimpleDialogState) => set({ state: newState }),
}))

// To be used in the layout only
export function SimpleDialog() {
  const { state } = useSimpleDialogState((state) => state)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return mounted && state ? (
    <Dialog
      type={state.type}
      title={state.title}
      closeIcon={state.closeIcon}
      okButton={state.okButton}
      cancelButton={state.cancelButton}
      onOk={state.onOk}
      onCancel={state.onCancel}
    >
      {state.message}
    </Dialog>
  ) : null
}

export function useSimpleDialog() {
  const { setState } = useSimpleDialogState((state) => state)

  const simpleDialog = async ({
    type,
    title,
    message,
    okButton,
    cancelButton,
  }: {
    type: Props['type']
    title: Props['title']
    message: string
    okButton?: Props['okButton']
    cancelButton?: Props['cancelButton']
  }): Promise<boolean> => {
    let resolveHolder: (result: boolean) => void
    const resultPromise = new Promise<boolean>((resolve) => (resolveHolder = resolve))

    const onCancel = () => {
      setState(null)
      resolveHolder(false)
    }

    const onOk = () => {
      setState(null)
      resolveHolder(true)
    }

    setState({
      type,
      title,
      closeIcon: true,
      message,
      okButton,
      cancelButton,
      onCancel,
      onOk,
    })

    return resultPromise
  }

  const messageDialog = async (args: {
    title: Props['title']
    message: string
    okButton?: Props['okButton']
  }) => simpleDialog({ ...args, type: 'info' })

  const confirmDialog = async (args: {
    title: Props['title']
    message: string
    cancelButton?: Props['cancelButton']
    okButton?: Props['okButton']
  }) => simpleDialog({ ...args, type: 'question' })

  const warningDialog = async (args: {
    title: Props['title']
    message: string
    cancelButton?: Props['cancelButton']
    okButton?: Props['okButton']
  }) => simpleDialog({ ...args, type: 'warning' })

  const criticalDialog = async (args: {
    title: Props['title']
    message: string
    cancelButton?: Props['cancelButton']
    okButton?: Props['okButton']
  }) => simpleDialog({ ...args, type: 'critical' })

  return { messageDialog, confirmDialog, warningDialog, criticalDialog }
}
