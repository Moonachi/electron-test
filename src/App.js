import { useEffect, useState } from "react"

const { ipcRenderer } = window

const App = () => {
  const [version, setVersion] = useState(0);
  const [protocol, setProtocol] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("")

  useEffect(() => {
    ipcRenderer.send("app_version");

    ipcRenderer.on("app_version", (event, args) => {
      setVersion(args.version);
    })
  }, [])

  return <div>
    <span>Electron Version {version}</span>
    <input value={protocol} onChange={e => setProtocol(e.target.value)} />
    <input value={ip} onChange={e => setIp(e.target.value)} />
    <input value={port} onChange={e => setPort(e.target.value)} />
    <button onClick={() => {
      ipcRenderer.send("get_data", { ip, port })
    }}>데이터 가져오기</button>
  </div>
}

export default App