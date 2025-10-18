import React, { useState, useEffect, Suspense, lazy } from "react";

const PreviewApp: React.FC = () => {
  const [Component, setComponent] =
    useState<React.LazyExoticComponent<any> | null>(null);
  const [props, setProps] = useState<Record<string, any>>({});
  const [componentInfo, setComponentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Notify extension that preview is ready
    window.parent?.postMessage({ type: "ready" }, "*");

    // Listen for messages from VSCode extension
    const handleMessage = (event: MessageEvent) => {
      const { type, props: newProps, componentInfo: info } = event.data;

      if (type === "updateComponent") {
        setComponentInfo(info);
        setProps(newProps || {});

        // Load the component dynamically - handle both default and named exports
        try {
          const UserComponent = lazy(() =>
            import("./UserComponent.tsx").then((module) => {
              // If we know the export type from the parser
              if (info?.exportType === "default") {
                if (!module.default) {
                  throw new Error("Expected default export but none found");
                }
                return { default: module.default };
              } else if (info?.exportType === "named") {
                const exportName = info.name;
                if (!module[exportName]) {
                  throw new Error(`Named export "${exportName}" not found`);
                }
                return { default: module[exportName] };
              }

              // Fallback: try default first, then named
              if (module.default) {
                return { default: module.default };
              }

              const exportName = info?.name;
              if (exportName && module[exportName]) {
                return { default: module[exportName] };
              }

              // Try to find any exported React component
              const exportedComponent = Object.keys(module).find((key) => {
                const value = module[key];
                return typeof value === "function" || (value && value.$$typeof);
              });

              if (exportedComponent && module[exportedComponent]) {
                return { default: module[exportedComponent] };
              }

              throw new Error(
                `No valid React component found. Expected ${
                  info?.exportType || "default or named"
                } export${exportName ? ` "${exportName}"` : ""}`
              );
            })
          );
          setComponent(() => UserComponent);
          setError(null);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const updateProp = (propName: string, value: any) => {
    const newProps = { ...props, [propName]: value };
    setProps(newProps);
    // Notify parent of prop change
    window.parent?.postMessage({ type: "propsChanged", props: newProps }, "*");
  };

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded text-red-700">
        <h3 className="font-bold mb-2">Error Loading Component</h3>
        <pre className="text-xs whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Props Control Panel */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            {componentInfo?.name || "Component Preview"}
          </h2>

          {Object.keys(props).length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Props ({Object.keys(props).length})
              </summary>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(props).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[100px]">
                      {key}:
                    </label>
                    {typeof value === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateProp(key, e.target.checked)}
                        className="rounded"
                      />
                    ) : typeof value === "number" ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          updateProp(key, parseFloat(e.target.value) || 0)
                        }
                        className="px-2 py-1 border rounded text-sm w-32"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => updateProp(key, e.target.value)}
                        className="px-2 py-1 border rounded text-sm flex-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Component Preview Area */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 text-gray-500">
                Loading component...
              </div>
            }
          >
            {Component && <Component {...props} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PreviewApp;
