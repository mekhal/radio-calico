/**
 * Minimal stand-in for the hls.js global (window.Hls) so tests don't depend
 * on the real network stream. See tests/README.md.
 */
(function (global) {
  function installMockHls() {
    class MockHls {
      constructor() {
        this._listeners = {};
        MockHls.instances.push(this);
      }
      loadSource(url) {
        this.source = url;
      }
      attachMedia(media) {
        this.media = media;
      }
      on(event, callback) {
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(callback);
      }
      trigger(event, data) {
        (this._listeners[event] || []).forEach((callback) => callback(event, data));
      }
      destroy() {
        this.destroyed = true;
      }
    }
    MockHls.instances = [];
    MockHls.isSupported = () => true;
    MockHls.Events = { MANIFEST_PARSED: "hlsManifestParsed", ERROR: "hlsError" };

    window.Hls = MockHls;
    return MockHls;
  }

  function latestHlsInstance() {
    const instances = window.Hls && window.Hls.instances;
    return instances && instances.length ? instances[instances.length - 1] : null;
  }

  global.installMockHls = installMockHls;
  global.latestHlsInstance = latestHlsInstance;
})(window);
