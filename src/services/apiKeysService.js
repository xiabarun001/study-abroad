export const apiKeysService = {
  getKeys() {
    return {
      llmKey: localStorage.getItem('sa_llm_key') || '',
      searchKey: localStorage.getItem('sa_search_key') || ''
    };
  },
  setKeys(llmKey, searchKey) {
    localStorage.setItem('sa_llm_key', llmKey);
    localStorage.setItem('sa_search_key', searchKey);
  }
};
