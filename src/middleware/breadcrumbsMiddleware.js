// breadcrumbMiddleware.js

const breadcrumbMiddleware = (req, res, next) => {
    req.breadcrumbs = [];

    // Add the Home breadcrumb
    req.breadcrumbs.push({ label: 'Home', url: '/' });

    // Check if req.route exists
    if (req.route) {
        // Iterate through the route stack and add breadcrumbs for each route
        req.route.stack.forEach(layer => {
            if (layer.route) {
                const path = layer.route.path;
                const label = path === '/' ? 'Home' : path.charAt(1).toUpperCase() + path.slice(2);
                const url = path === '/' ? '/' : req.baseUrl + path;

                req.breadcrumbs.push({ label, url });
            }
        });
    }

    next();
};

module.exports = breadcrumbMiddleware;
