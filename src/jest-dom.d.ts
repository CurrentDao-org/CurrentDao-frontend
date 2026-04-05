/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R = void, T = {}> {
      toBeInTheDocument(): R
      toBeVisible(): R
      toBeEmptyDOMElement(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeAssumedToBeVisible(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toContainElement(element: Element | HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveAttribute(attr: string, value?: string | RegExp): R
      toHaveClass(className: string | string[]): R
      toHaveFocus(): R
      toHaveStyle(css: string | Record<string, any>): R
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R
      toHaveValue(value: string | number | string[]): R
      toHaveDisplayValue(value: string | string[]): R
      toBePartiallyChecked(): R
      toHaveFormValues(values: Record<string, any>): R
      toBeChecked(): R
    }
  }
}

export {}

