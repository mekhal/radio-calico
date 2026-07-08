const STREAM_URL = "https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8";

function App() {
  const audioRef = React.useRef(null);
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let hls;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(STREAM_URL);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setStatus("ready");
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setStatus("error");
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari has native HLS support
      audio.src = STREAM_URL;
      audio.addEventListener("loadedmetadata", () => setStatus("ready"));
      audio.addEventListener("error", () => setStatus("error"));
    } else {
      setStatus("unsupported");
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, []);

  return (
    <div>
      <h1>Radio Calico</h1>
      <p>Status: {status}</p>
      <audio ref={audioRef} controls autoPlay />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
