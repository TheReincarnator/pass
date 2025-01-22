import "@/components/common/css/reset.css"
import "@/components/common/css/layout.css"
import "@/components/common/css/overlay.css"
import "@/components/common/css/overlay-small.css"
import "@/components/common/css/richtext.css"
import "@/components/common/css/richtext-small.css"
import "@/components/common/css/inputs.css"
import "@/components/common/css/inputs-small.css"
import "@/components/common/css/font-awesome.min.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pass. Deine Passwörter.",
  description: "Pass. Für deine Passwörter und sensiblen Daten.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="de">
      <head>
        <title>Pass. Deine Passwörter.</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/images/favicon.png" />

        <meta name="description" content="Pass. Für deine Passwörter und sensiblen Daten." />
        <meta name="keywords" content="password,safe,store,keystore,keys" />
        <meta name="robots" content="index,follow" />
      </head>

      <body className="page">
        <div id="page" className="site site--no-navigation">
          <header id="masthead" className="site-header" role="banner">
            <div className="header-main">
              <Link href="/" className="header-logo" rel="home">
                Start page
              </Link>
              <h1 className="site-title">
                <Link href="/" rel="home">
                  Pass.
                </Link>
              </h1>
              <h2 className="site-description">Für deine Passwörter und sensiblen Daten.</h2>
              <a href="javascript://" className="mobile-navigation">
                <i className="fa fa-bars"></i>
              </a>
            </div>
          </header>

          <div id="main" className="site-main">
            <div id="main-content" className="main-content">
              <div id="primary" className="content-area">
                <div id="content" className="site-content" role="main">
                  {children}
                </div>
              </div>
            </div>
          </div>

          <footer id="colophon" className="site-footer" role="contentinfo">
            <div id="supplementary">
              <div id="footer-sidebar" className="footer-sidebar" role="complementary">
                <aside>
                  <ul>
                    <li className="page_item">
                      <a
                        href="https://www.thomasjacob.de/footer/contact/"
                        title="Contact"
                        target="_blank"
                      >
                        Contact
                      </a>
                    </li>
                    <li className="page_item">
                      <a
                        href="http://www.thomasjacob.de/footer/imprint/"
                        title="Imprint and notes"
                        target="_blank"
                      >
                        Imprint and notes
                      </a>
                    </li>
                  </ul>
                </aside>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
