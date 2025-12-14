# OpenSlots - Appointment Booking System

A Google Sheets/Forms/Calendar-based appointment booking system for managing appointments across multiple service providers.

## 📚 Documentation

- **[REQUIREMENTS.md](REQUIREMENTS.md)** - Complete system requirements and specifications
- **[MVP_PLAN.md](MVP_PLAN.md)** - MVP-based implementation roadmap with 8 iterations
- **[GITHUB_ISSUES.md](GITHUB_ISSUES.md)** - Reference document with all 45 detailed issues (issues are now in GitHub)

## 🎯 Quick Start

This project uses an **MVP (Minimum Viable Product) approach** with 8 iterative releases:

### MVP 1: Basic Booking (1-2 days)
- Manual booking with Google Sheets
- Data validation and structure
- [Issues #1-4](https://github.com/jjgao/openslots/issues?q=is%3Aissue+is%3Aopen+label%3Amvp-1)

### MVP 2: Calendar Integration (2-3 days)
- Automatic Google Calendar sync
- Double-booking prevention
- [Issues #5-10](https://github.com/jjgao/openslots/milestone/2)

### MVP 3: Booking UI (3-4 days)
- Fast booking interface
- Client search and history
- [Issues #11-14](https://github.com/jjgao/openslots/milestone/3)

### MVP 4: Appointment Management (2-3 days)
- Cancel/reschedule/check-in
- Activity logging
- [Issues #15-20](https://github.com/jjgao/openslots/milestone/4)

### MVP 5: Daily Lists (2-3 days)
- Automated provider emails
- Change notifications
- [Issues #21-24](https://github.com/jjgao/openslots/milestone/5)

### MVP 6: Confirmations (1-2 days)
- Track confirmation calls/texts
- [Issue #25](https://github.com/jjgao/openslots/milestone/6)

### MVP 7: Reporting (2-3 days)
- Analytics and insights
- [Issues #26-30](https://github.com/jjgao/openslots/milestone/7)

### MVP 8: Production Ready (3-5 days)
- Documentation, training, launch
- [Issues #31-39](https://github.com/jjgao/openslots/milestone/8)

**Total Estimated Time**: 17-27 days (3-5 weeks)

## 🚀 Recommended Path

Start with **MVPs 1-2-3** for a working booking system in ~2 weeks:

```bash
# View MVP 1 issues
gh issue list --label "mvp-1"

# Start with the first issue
gh issue view 1
```

After MVP 3, you'll have:
- ✅ Book appointments with UI
- ✅ Calendar sync
- ✅ Client search and history
- ✅ Available time slots

Then pause, gather feedback, and decide next steps.

## 📋 Current Issues

- **42 total issues** created in GitHub
- **39 core MVP issues** (#1-39)
- **3 future enhancements** (#40-42)

View all issues: https://github.com/jjgao/openslots/issues

## 🛠 Technology Stack

- **Google Sheets** - Data storage
- **Google Forms** - Data entry (optional)
- **Google Calendar** - Visual schedules
- **Google Apps Script** - Automation (JavaScript)
- **Google Workspace** - Authentication and collaboration

All tools are free with Google Workspace account.

## 📖 System Overview

### Core Features
- Multi-provider scheduling (5-10 providers)
- Service type management
- Client history tracking
- Receptionist-operated (shared access)
- Comprehensive activity logging
- Automated daily appointment lists
- Provider notifications
- Reporting and analytics

### Data Structure
9 Google Sheets tabs:
1. Providers
2. Services
3. Clients
4. Appointments
5. Provider_Availability
6. Provider_Exceptions
7. Activity_Log
8. Confirmation_Tracking
9. System_Config

## 🎓 Getting Started

1. **Read the requirements**: [REQUIREMENTS.md](REQUIREMENTS.md)
2. **Review MVP plan**: [MVP_PLAN.md](MVP_PLAN.md)
3. **Start with MVP 1**: [Issue #1](https://github.com/jjgao/openslots/issues/1)

## 🤝 Contributing

This is an internal project. For questions or issues:
- Create a GitHub issue
- Tag with appropriate MVP label

## 📝 License

Internal use only.

---

🤖 Documentation generated with [Claude Code](https://claude.com/claude-code)
