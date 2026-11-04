import './globals.css'
import type {Metadata} from 'next'
export const metadata:Metadata={title:'Arcana — Коллекция карточек',description:'Коллекционная карточная гача'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
