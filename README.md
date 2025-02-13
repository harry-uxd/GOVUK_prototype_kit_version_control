# Version Control in the GOV.UK Prototype Kit

This guide explains how to implement version control in the GOV.UK Prototype Kit, allowing you to manage multiple versions of your prototype while keeping the routing process mostly automated. The approach ensures that forms and redirects work seamlessly across versions without hardcoding version-specific paths.

---

## Key Features

1. **Version-Agnostic Forms**: HTML forms do not require hardcoded `action` attributes, making them reusable across versions.
2. **Automated Routing**: Middleware automatically prefixes redirects with the correct version path (e.g., `/v1/question-1`).
3. **Scalable Structure**: Adding a new version is straightforward and requires minimal changes.

------

## Code Structure

The prototype is organized as follows:

```
/project-root
  ├── app/
  │   ├── routes.js
  │   └── views/
  │       ├── v1/
  │       │   ├── routing.js
  │       │   └── question-1.html
  │       │   └── question-2.html
  │       └── v2/
  │           ├── routing.js
  │           └── question-1.html
  │           └── question-2.html
```

- **`routes.js`**: Mounts version-specific routers under `/v1`, `/v2`, etc.
- **`v1/routing.js`**: Defines routes and middleware for version 1.
- **`v1/question-1.html`**: HTML page for question 1.
- **`v1/question-2.html`**: HTML page for question 2.

---

## How It Works

### 1. **Form Submissions Without `action` Attributes**

In the HTML forms, the `action` attribute is omitted. This allows the form to submit to the current URL path, which already includes the version prefix (e.g., `/v1/question-1`).

#### Example Form

```html
<form method="post" novalidate>
  <h1 class="govuk-heading-xl">Question 1</h1>
  <button type="submit" class="govuk-button" data-module="govuk-button">
    Continue
  </button>
</form>
```

- **Why This Works**: When the form is submitted, it POSTs to the current URL (e.g., `/v1/question-1`). The middleware then handles the redirects, ensuring they stay within the same version.

------

### 2. **Middleware for Automated Redirects**

A middleware function overrides `res.redirect` to automatically prefix redirect URLs with the current version's base path.

#### Middleware Code

```javascript
subRouter.use((req, res, next) => {
  const originalRedirect = res.redirect;
  res.redirect = function (url) {
    if (url.startsWith('/')) {
      url = req.baseUrl + url; 
    }
    return originalRedirect.call(this, url);
  };
  next();
});
```

- **How It Works**: When a redirect is triggered (e.g., `res.redirect('/question-2')`), the middleware prepends the version prefix (e.g., `/v1/question-2`).

------

### 3. **Defining Routes**

Routes are version specific and are defined in the `routing.js` file located in `v1` and `v2` directories. Because the middleware automatically handles the version, we only need to define the routes once.

#### Example Route Definition

```javascript
subRouter.post('/question-1', (req, res) => {
  res.redirect('/question-2'); // The middleware will automatically prefix this with the version, e.g., /v1/question-2
});
```

In this example, the [`subRouter.post('/question-1', ...)`](vscode-file://vscode-app/private/var/folders/s8/8myp68jx75n9v9mpfrg9kp4m0000gn/T/AppTranslocation/F2F077E9-9EFC-4965-987B-355CD59C8C65/d/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) line corresponds to handling form submissions from the `question-1.html` file in the `v1` directory. 

To handle routes from another file in the same directory, for example, `sign-in.html` You should write the following,

``` javascript
subRouter.post('/sign-in', (req, res) => {
  res.redirect('/question-2'); 
});
```



------

### 4. **Mounting Version-Specific Routers**

In the central `routes.js` file, each version's router is mounted under its respective base path.

#### Example `routes.js`

```javascript
const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Mount version-specific routers
router.use('/v1', require('./views/v1/routing')());
router.use('/v2', require('./views/v2/routing')());

module.exports = router;
```

- **How It Works**: Requests to `/v1/question-1` are handled by the `v1` router, while requests to `/v2/question-1` are handled by the `v2` router.

------

## Creating a New Version

To add a new version (e.g., `v3`), follow these steps:

1. **Create a New Directory**:

   - Duplicate the `v2` directory and rename it to `v3`.

2. **Mount the New Router**:

   - In `routes.js`, add a new line to mount the `v3` router:

     ```javascript
     router.use('/v3', require('./views/v3/routing')());
     ```

3. **Test the New Version**:

   - Access `http://localhost:3000/v3/question-1` and verify that forms and redirects work as expected.

------

## Benefits of This Approach

1. **No Hardcoding**: Forms and routes do not require version-specific paths, making them reusable across versions.
2. **Automated Routing**: Middleware handles redirects, ensuring they stay within the correct version.
3. **Scalable**: Adding new versions is quick and easy.

------

## Example Workflow

1. **Access Version 1**:
   - Go to `http://localhost:3000/v1/question-1`.
   - Submit the form → Redirects to `/v1/question-2`.
2. **Access Version 2**:
   - Go to `http://localhost:3000/v2/question-1`.
   - Submit the form → Redirects to `/v2/question-2`.

------

## Troubleshooting

- **404 Errors**: Ensure the `routes.js` file mounts each version's router correctly (e.g., `/v1`, `/v2`).
- **Incorrect Redirects**: Verify that the middleware is correctly prefixing redirect URLs with `req.baseUrl`.

------

## Resources:

<link to github repo>
