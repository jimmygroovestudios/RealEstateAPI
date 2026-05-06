# Real Estate API Endpoints

Complete API reference for the Real Estate MVP platform, inspired by Zillow and Redfin.

**Base URL:** `http://localhost:4000/api/v1`

---

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/refresh` | Refresh access token | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

---

## Properties

### Search & Browse

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/properties` | Search properties with filters | ❌ |
| GET | `/properties/featured` | Get featured listings | ❌ |
| GET | `/properties/nearby` | Get nearby properties by location | ❌ |
| GET | `/properties/favorites` | Get user's saved properties | ✅ |
| GET | `/properties/:id` | Get property details | ❌ |

**Search Query Parameters:**
- `page`, `limit` - Pagination
- `minPrice`, `maxPrice` - Price range
- `minBeds`, `maxBeds` - Bedroom count
- `minBaths`, `maxBaths` - Bathroom count
- `minSqft`, `maxSqft` - Square footage
- `propertyType` - HOUSE, CONDO, TOWNHOUSE, APARTMENT, LAND, MULTI_FAMILY
- `city`, `state`, `zipCode` - Location
- `status` - ACTIVE, PENDING, SOLD, OFF_MARKET
- `lat`, `lng`, `radius` - Geolocation search (miles)
- `hasPool`, `hasGarage` - Amenities
- `sortBy`, `sortOrder` - Sorting

### Property Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/properties/:id/price-history` | Get price change history | ❌ |
| GET | `/properties/:id/comparables` | Get similar properties nearby | ❌ |
| GET | `/properties/:id/estimate` | Get Zestimate-style valuation | ❌ |
| GET | `/properties/:id/views` | Get view statistics | ❌ |

### Property Management (Agents)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/properties` | Create new listing | ✅ Agent |
| PUT | `/properties/:id` | Update listing | ✅ Agent |
| DELETE | `/properties/:id` | Delete listing | ✅ Agent |
| POST | `/properties/:id/images` | Add property image | ✅ Agent |
| DELETE | `/properties/:id/images/:imageId` | Remove image | ✅ Agent |

### User Actions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/properties/:id/favorite` | Toggle favorite | ✅ |

---

## Leads

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/leads` | List leads (agent dashboard) | ✅ Agent |
| GET | `/leads/stats` | Get lead statistics | ✅ Agent |
| GET | `/leads/:id` | Get lead details | ✅ |
| POST | `/leads` | Submit inquiry on property | ✅ |
| PATCH | `/leads/:id` | Update lead status | ✅ Agent |
| POST | `/leads/:id/notes` | Add follow-up note | ✅ |

**Lead Statuses:** NEW, CONTACTED, QUALIFIED, SHOWING_SCHEDULED, OFFER_MADE, CLOSED_WON, CLOSED_LOST, UNRESPONSIVE

---

## Showings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/showings` | List my showings | ✅ |
| GET | `/showings/calendar` | Get agent's showing calendar | ✅ Agent |
| GET | `/showings/:id` | Get showing details | ✅ |
| POST | `/showings` | Request a showing | ✅ |
| PATCH | `/showings/:id` | Confirm/reschedule showing | ✅ Agent |
| POST | `/showings/:id/cancel` | Cancel showing | ✅ |
| POST | `/showings/:id/feedback` | Add post-showing feedback | ✅ |

**Showing Statuses:** REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

---

## Neighborhoods

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/neighborhoods/:zipCode` | Get neighborhood overview | ❌ |
| GET | `/neighborhoods/:zipCode/schools` | Get school ratings | ❌ |
| GET | `/neighborhoods/:zipCode/crime` | Get safety scores | ❌ |
| POST | `/neighborhoods/:zipCode/commute` | Calculate commute time | ❌ |
| GET | `/neighborhoods/:zipCode/demographics` | Get population stats | ❌ |
| GET | `/neighborhoods/:zipCode/market` | Get local market trends | ❌ |

---

## Market Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/market/trends?zipCode=` | Get market trends by area | ❌ |
| GET | `/market/hotness` | Get hot markets ranking | ❌ |
| GET | `/market/forecast?zipCode=` | Get price predictions | ❌ |
| GET | `/market/inventory` | Get supply/demand metrics | ❌ |

---

## Mortgage Tools

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tools/mortgage/calculate` | Calculate monthly payment | ❌ |
| POST | `/tools/mortgage/affordability` | How much can I afford? | ❌ |
| GET | `/tools/mortgage/rates` | Get current mortgage rates | ❌ |
| POST | `/tools/mortgage/prequalify` | Basic pre-qualification | ❌ |

### Mortgage Calculator Request
```json
{
  "principal": 500000,
  "annualRate": 6.5,
  "termYears": 30,
  "downPayment": 100000,
  "propertyTax": 6000,
  "insurance": 1800,
  "hoa": 200
}
```

### Affordability Calculator Request
```json
{
  "annualIncome": 120000,
  "monthlyDebts": 500,
  "downPayment": 80000,
  "annualRate": 6.5,
  "termYears": 30
}
```

---

## Agents

### Public

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/agents` | Search agents | ❌ |
| GET | `/agents/:id` | Get agent profile | ❌ |
| GET | `/agents/:id/reviews` | Get agent reviews | ❌ |
| GET | `/agents/:id/stats` | Get agent statistics | ❌ |
| POST | `/agents/:id/reviews` | Submit agent review | ✅ |

### Agent Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/overview` | Dashboard summary | ✅ Agent |
| GET | `/dashboard/listings` | My active listings | ✅ Agent |
| GET | `/dashboard/performance` | Sales metrics | ✅ Agent |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `/auth/login` and can be refreshed via `/auth/refresh`.

---

## Rate Limiting

- **100 requests** per 15 minutes per IP
- Rate limit headers included in responses

---

## API Documentation

Interactive Swagger documentation available at:
```
http://localhost:4000/api-docs
```
