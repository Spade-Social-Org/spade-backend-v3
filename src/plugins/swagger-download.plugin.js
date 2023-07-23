// swagger-download.plugin.js
const SwaggerDownloadPlugin = () => {
  return {
    components: {
      Topbar: () => {
        return {
          view: () => ({
            render: () => `
              <div style="display: flex; align-items: center;">
                <button id="downloadSwaggerButton" type="button" style="margin-right: 10px;">Download Swagger</button>
              </div>
            `,
            init: (el) => {
              document
                .getElementById('downloadSwaggerButton')
                .addEventListener('click', () => {
                  fetch('/api-docs-json')
                    .then((response) => response.json())
                    .then((data) => {
                      const filename = 'swagger.json';
                      const blob = new Blob([JSON.stringify(data)], {
                        type: 'application/json',
                      });
                      const link = document.createElement('a');
                      link.href = window.URL.createObjectURL(blob);
                      link.download = filename;
                      link.click();
                    });
                });
            },
          }),
        };
      },
    },
  };
};

window.onload = () => {
  const ui = SwaggerUIBundle({
    // Your Swagger UI configuration options
  });
  ui.registerPlugin(SwaggerDownloadPlugin);
};
