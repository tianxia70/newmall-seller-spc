import { createPinia } from "pinia";
import { createPersistedState } from 'pinia-plugin-persistedstate';
import useLanguageStore from "./modules/language";
import useAppStore from "./modules/app";
import useKeepAliveStore from './modules/keepAlive'
import useTagStore from './modules/tag'
import useIframeStore from './modules/iframe'

const pinia = createPinia();
pinia.use(createPersistedState())

export {
  useLanguageStore,
  useAppStore,
  useKeepAliveStore,
  useTagStore,
  useIframeStore
};

export default pinia;