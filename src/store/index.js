import { createPinia } from "pinia";
import { createPersistedState } from 'pinia-plugin-persistedstate';
import useCurrencyStore from './modules/currency'
import useAppStore from "./modules/app";
import useKeepAliveStore from './modules/keepAlive'
import useTagStore from './modules/tag'
import useIframeStore from './modules/iframe'
import useSystemStore from './modules/system'
import useUserStore from './modules/user'
import useChatStore from './modules/chat'

const pinia = createPinia();
pinia.use(createPersistedState())

export {
  useAppStore,
  useCurrencyStore,
  useKeepAliveStore,
  useTagStore,
  useIframeStore,
  useSystemStore,
  useUserStore,
  useChatStore
};

export default pinia;