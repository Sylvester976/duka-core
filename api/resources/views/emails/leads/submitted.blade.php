<x-mail::message>
# New custom plan lead

A visitor requested the white-glove/custom plan on the marketing site.

- **Name:** {{ $lead->name }}
- **Email:** {{ $lead->email }}
@if ($lead->company)
- **Company:** {{ $lead->company }}
@endif

**Message:**

{{ $lead->message }}

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
