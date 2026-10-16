# Leihbase

Leihbase is a web application that covers every aspect of running one or
multiple Borrow Stores (or Libraries of Things): community-driven spaces where
people can borrow items instead of buying them.

## Features

- 🏪 Webshop-style catalog of borrowable products, with category filtering
- 🎫 Online reservations, with user sign-up/login
- 👷 Admin section to manage products, reservations and statistics across
  multiple locations
- 📧 Email confirmations and pickup/return reminders, with customizable
  templates
- 🎨 Themeable, available in English and German

## Screenshots

<img src="./screenshots/screenshot-index-page.png" width="49%" /><img src="./screenshots/screenshot-product-page.png" width="49%" /><img src="./screenshots/screenshot-reservation-dialog.png" width="49%" /><img src="./screenshots/screenshot-admin-page.png" width="49%" /><img src="./screenshots/screenshot-admin-reservation-drawer.png" width="49%" /><img src="./screenshots/screenshot-statistics-page.png" width="49%" />

## Tech

- Back-end and API using [PocketBase](https://pocketbase.io/)
- Front-end with server-side rendering using [Nuxt](https://nuxt.com/)

## Deployment

### Docker

Leihbase has two Docker Images available which are both required to set up the
application:

- [leihbase-webapp](https://hub.docker.com/r/lumocra/leihbase-webapp)
- [leihbase-pb](https://hub.docker.com/r/lumocra/leihbase-pb)

Images are tagged with the release version, `latest` is built from the `next`
branch. Pinning a release version is recommended.

Use the following docker-compose.yml as a base to deploy Leihbase using Docker:

```yaml
services:
  leihbase-webapp:
    image: lumocra/leihbase-webapp:v2.3.0
    container_name: leihbase-webapp
    environment:
      NUXT_PUBLIC_LOCALE: "en"
      NUXT_PUBLIC_POCKETBASE_SERVER_BASE_URL: http://leihbase-pb:8090
      NUXT_PUBLIC_POCKETBASE_CLIENT_BASE_URL: <leihbase-pb public url>
      # Plausible settings (https://plausible.io/)
      NUXT_PUBLIC_PLAUSIBLE_TRACKING_DOMAIN: ""
      # Captcha settings (https://trycap.dev)
      NUXT_PUBLIC_CAP_INSTANCE_HOST: ""
      NUXT_PUBLIC_CAP_SITE_KEY: ""

  leihbase-pb:
    image: lumocra/leihbase-pb:v2.3.0
    container_name: leihbase-pb
    environment:
      CONFIG_LOCALE: "en"
      # If a reservation (created in the admin section) is required to have a user
      CONFIG_RESERVATION_REQUIRE_USER: "false"
      # Captcha settings (https://trycap.dev)
      CONFIG_CAP_INSTANCE_HOST: ""
      CONFIG_CAP_SITE_KEY: ""
      CONFIG_CAP_SECRET_KEY: ""
    volumes:
      - ./pb_data:/pb/pb_data
```

#### Environment variables

`leihbase-webapp`:

| Variable                                 | Description                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `NUXT_PUBLIC_LOCALE`                     | Language of the front-end: `en` or `de`                                       |
| `NUXT_PUBLIC_POCKETBASE_SERVER_BASE_URL` | URL used by the webapp server to reach PocketBase (e.g. the internal network) |
| `NUXT_PUBLIC_POCKETBASE_CLIENT_BASE_URL` | Public URL used by the browser to reach PocketBase                            |
| `NUXT_PUBLIC_PLAUSIBLE_TRACKING_DOMAIN`  | Optional, enables [Plausible](https://plausible.io/) analytics                |
| `NUXT_PUBLIC_CAP_INSTANCE_HOST`          | Optional, [Cap](https://trycap.dev) captcha instance host                     |
| `NUXT_PUBLIC_CAP_SITE_KEY`               | Optional, Cap captcha site key                                                |

`leihbase-pb`:

| Variable                          | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `CONFIG_LOCALE`                   | Language of the emails: `en` or `de`                                             |
| `CONFIG_RESERVATION_REQUIRE_USER` | If a reservation created in the admin section is required to be linked to a user |
| `CONFIG_CAP_INSTANCE_HOST`        | Optional, Cap captcha instance host                                              |
| `CONFIG_CAP_SITE_KEY`             | Optional, Cap captcha site key                                                   |
| `CONFIG_CAP_SECRET_KEY`           | Optional, Cap captcha secret key                                                 |

#### Email

To send emails (reservation confirmations, reminders, notifications), configure
an SMTP server in the PocketBase admin interface (`/_/` > Settings > Mail
settings). Pickup and return reminders are sent by a cron job every day at 12:00
(UTC).

#### Updating & backups

Database migrations are applied automatically when PocketBase starts, so
updating is a matter of changing the image versions and restarting the
containers. Make sure to back up the `pb_data` volume before updating, it
contains all data and uploaded files.

### Fly.io

The repository contains [fly.toml](https://fly.io/docs/reference/configuration/)
files to deploy the service as [fly.io](https://fly.io) applications.

### Initial setup

Leihbase does not have a setup flow yet. After starting the services, enter some
initial data to be able to use the application:

1. Browse to `<leihbase-pb url>/_/` to visit the PocketBase admin interface
1. Create a PocketBase superuser account
1. Create a record in the `leihbase` collection, containing some configuration
   settings for the instance (see [Configuration](#configuration))
1. Create a location in the `location` collection (make sure to set the location
   as 'active')
1. Create a product in the `products` collection (make sure to set the product
   as 'active')
1. Sign up via the front-end, and in the PocketBase admin interface set the
   `role` of your user in the `users` collection to `admin` to get access to the
   Leihbase admin section
1. Now you should be able to visit the front-end

## Configuration

### Users & roles

Users have a `role` which can be set in the PocketBase admin interface in the
`users` collection:

- `user`: can make and manage their own reservations
- `manager`: can manage the products, reservations and opening hours of the
  locations selected in the user's `manager_locations` field
- `admin`: can manage all locations, and the email templates

### Leihbase

The single record in the `leihbase` collection contains instance-wide settings:

- `description`, `image`: shown on the front page
- `imprint`, `privacy_policy`: content of the imprint and privacy policy pages
- `privacy_policy_link`: if set, users have to accept it when signing up
- `footer_links`: links shown in the footer, in the same JSON format as location
  [links](#links)
- `style`: CSS variables to theme the front-end, for example:

```css
--background-color: #ffdbc4;
--primary-color: #0d79f2;
--secondary-color: #ffede2;
--text-color: #061134;
--border-radius: 5px;
```

### Email templates

Admins can customize the emails sent by Leihbase per location in the admin
section (Settings > Configure email templates). If no custom template is
enabled, the default template for the configured locale is used.

### Location

#### Notifications

Using the following JSON format the email addresses which should receive
notifications of this location can be configured:

```json
["example@example.com", "sarah@example.com"]
```

#### Links

Links shown on the location page.

```json
[
  {
    "text": "Leihbar Website",
    "link": "https://leihbar-koeln.de"
  }
]
```

#### Opening Hours

Managers and admins can edit the opening hours of a location in the admin
section (Opening hours). They are stored in the following JSON format:

```json
{
  "days": {
    "tuesday": [
      {
        "from": "18:00",
        "to": "19:00"
      }
    ],
    "friday": [
      {
        "from": "17:00",
        "to": "19:00"
      }
    ]
  },
  "except": {
    "dates": ["2024-12-25", "2024-12-26", "2024-12-31", "2025-01-01"]
  }
}
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to set up a development
environment, run the tests and contribute changes.

## License

Leihbase is licensed under the
[GNU Affero General Public License v3.0](./LICENSE).
