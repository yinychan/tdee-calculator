import React from "react"
import classNames from "classnames"
import useDesktop from "~/hooks/useDesktop"

import styles from "./Container.module.css"

type ContainerProps = {
  className?: string
  children: React.ReactNode
  element?: keyof JSX.IntrinsicElements
  theme?: string
  type?: string
  align?: string
  justify?: string
  spacing?: boolean
  wrapper?: number | null
} & React.HTMLAttributes<Element>

export default function Container({ 
  className, 
  children,
  element = 'section',
  theme, 
  type, 
  align,
  justify,
  spacing, 
  wrapper = type === 'popout' ? 1200 : null, 
  ...props
}: ContainerProps) {

  const HTMLElement = element
  const isDesktop = useDesktop()

  return (
    <HTMLElement 
    	className={classNames(
    		!spacing && styles.main, 
    		className, 
        type && styles[type], 
        justify && styles['content-' + justify], 
        align && styles['container-' + align], 
        theme && styles[theme],
    	)}
      {...props}
    >
      {(isDesktop && wrapper) ? (
        <div className={classNames(styles.wrapper, styles[`wrapper--${wrapper}`])}>
        {children}
      </div>  
      ) : (
        <>
          {children}
        </>  
      )}
    </HTMLElement>
  )
}