import { LangContext } from "../../js/contexts"
import { useContext, useEffect, useRef } from "react";
export default function Preferences({ setCurrentLanguage }) {
  const lang = useContext(LangContext)
  const langCode = localStorage.getItem('lang')
  const selectRef = useRef(null)
  const langFiles = [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['ru', 'Русский'],
  ['ja', '日本人 '], ['ko', '한국인 '], ['pt', 'Português'], ['ar', 'عربي '], ['it', 'Italiano'], ['zh', '中国人']]
  langFiles.sort()
  useEffect(() => {
    if (langCode) selectRef.current.value = langCode
  })
  const betaText = String.fromCodePoint(0x000A0) + String.fromCodePoint(0x000A0) + String.fromCodePoint(0x000A0) + '(beta)'

  return (
    <>
      <div className="preferencesContainer">
        <h3>{lang.settings.language}</h3>
        <select name="" id="" ref={selectRef} size={1}
          defaultValue={langCode ? langCode : 'en'}
          onChange={(e) => { changeLanguage(e.currentTarget.value) }}>
          {
            langFiles.map((value, index) => {
              return (<option key={index} value={value[0]} >{value[1]}</option>)
            })}
        </select>
      </div>
    </>
  )
  function changeLanguage(lang) {
    setCurrentLanguage(lang);
    localStorage.setItem('lang', lang)
  }
}