//import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { ApolloProvider } from "@apollo/client/react"
import { client } from "./lib/graphql/client"
//import { AuthProvider } from "./contexts/AuthContext.tsx"

createRoot(document.getElementById("root")!).render(

    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
)
