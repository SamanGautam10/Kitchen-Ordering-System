import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TablesProvider } from './context/TablesContext';
import { OrderProvider } from "./context/OrderItemContext.jsx";
import { AutoFetchProvider   } from "./context/AutoFetchContext";
import  { MenuProvider } from "./context/MenuContext.jsx"
import App from './App.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MenuProvider>
    <TablesProvider>
    <OrderProvider>
      <AutoFetchProvider>
        <App />
      </AutoFetchProvider>
    </OrderProvider>
    </TablesProvider>
    </MenuProvider>
  </StrictMode>,
)