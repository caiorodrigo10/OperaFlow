<div align="center">

# OperaFlow - Open Source Operational AI Platform

*Your new operational AI that understands, builds, and executes*

![OperaFlow Banner](frontend/public/banner.png)

OperaFlow is a fully open source AI platform that helps you accomplish real-world tasks with ease. Through natural conversation, OperaFlow becomes your digital companion for research, data analysis, automation, and everyday challenges—combining powerful capabilities with an intuitive interface that understands what you need and delivers results.

OperaFlow's powerful toolkit includes seamless browser automation to navigate the web and extract data, file management for document creation and editing, web crawling and extended search capabilities, command-line execution for system tasks, website deployment, and integration with various APIs and services. These capabilities work together harmoniously, allowing OperaFlow to solve your complex problems and automate workflows through simple conversations!

[![License](https://img.shields.io/badge/License-Apache--2.0-blue)](./LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/caioapfelbaum/OperaFlow)](https://github.com/caioapfelbaum/OperaFlow)
[![Issues](https://img.shields.io/github/issues/caioapfelbaum/OperaFlow)](https://github.com/caioapfelbaum/OperaFlow/issues)

</div>

## Table of Contents

- [OperaFlow Architecture](#project-architecture)
  - [Backend API](#backend-api)
  - [Frontend](#frontend)
  - [Agent Execution Environment](#agent-execution-environment)
  - [Supabase Database](#supabase-database)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Self-Hosting](#self-hosting)
- [Contributing](#contributing)
- [License](#license)

## Project Architecture

![Architecture Diagram](docs/images/diagram.png)

OperaFlow consists of four main components working together to provide a complete operational AI platform:

### Backend API

Python/FastAPI service that handles REST endpoints, thread management, and LLM integration with Anthropic, OpenAI, and others via LiteLLM. The backend orchestrates all AI operations and manages the communication between different system components.

### Frontend

Next.js/React application providing a responsive UI with chat interface, dashboard, agent configuration, and real-time monitoring. Built with modern web technologies including Tailwind CSS and TypeScript for a seamless user experience.

### Agent Execution Environment

Isolated Docker-based execution environment for every agent with browser automation, code interpreter, file system access, tool integration, and comprehensive security features. Each agent operates in its own sandbox for maximum security and reliability.

### Supabase Database

Handles data persistence with authentication, user management, conversation history, file storage, agent state, analytics, and real-time subscriptions. Provides a robust foundation for multi-tenant operations.

## Key Features

### 🤖 **Intelligent Agent System**
- **Custom Agent Creation**: Build specialized AI agents for specific tasks and workflows
- **Multi-Model Support**: Integration with Anthropic Claude, OpenAI GPT, and other leading LLM providers
- **Agent Templates**: Pre-configured agents for common use cases

### 🔧 **Powerful Tool Ecosystem**
- **Browser Automation**: Navigate websites, fill forms, extract data automatically
- **File Management**: Create, edit, and organize documents and files
- **Command Line Interface**: Execute system commands and scripts
- **Web Search & Scraping**: Advanced research capabilities with real-time data access
- **Data Processing**: Transform and analyze data from multiple sources

### 🔗 **Extensible Integration Platform**
- **MCP (Model Context Protocol)**: Connect external services and APIs seamlessly
- **Data Providers**: Access LinkedIn, Twitter, Amazon, Yahoo Finance, and more
- **Custom Integrations**: Build your own connectors and tools
- **Workflow Automation**: Chain tasks and create complex automation pipelines

### 🛡️ **Enterprise-Ready Security**
- **Sandboxed Execution**: Each agent runs in isolated Docker containers
- **Multi-Tenant Architecture**: Secure separation between users and organizations
- **Authentication & Authorization**: Robust user management with Supabase Auth
- **Audit Logging**: Complete activity tracking and monitoring

### 📊 **Advanced Analytics & Monitoring**
- **Real-time Dashboards**: Monitor agent performance and system health
- **Usage Analytics**: Track costs, performance, and usage patterns
- **Error Tracking**: Comprehensive error handling and debugging tools
- **Performance Optimization**: Built-in cache optimization and performance monitoring

## Use Cases

### 🔍 **Research & Analysis**
- **Competitor Analysis** - Analyze markets, competitors, and industry trends automatically
- **Data Collection** - Gather information from multiple sources and compile comprehensive reports
- **Market Research** - Track pricing, product updates, and market movements

### 💼 **Business Automation**
- **Lead Generation** - Find and qualify potential customers from various platforms
- **Content Creation** - Generate reports, presentations, and marketing materials
- **Process Automation** - Automate repetitive tasks and workflows

### 🔧 **Development & Operations**
- **Code Analysis** - Review codebases, identify issues, and suggest improvements
- **Deployment Automation** - Automate deployment processes and infrastructure management
- **Monitoring & Alerting** - Set up automated monitoring and response systems

### 📈 **Data Processing**
- **Data Transformation** - Clean, process, and transform data from multiple sources
- **Report Generation** - Create automated reports with charts, graphs, and insights
- **Integration Tasks** - Connect different systems and synchronize data

## Self-Hosting

OperaFlow can be self-hosted on your own infrastructure using our comprehensive setup wizard. For a complete guide to self-hosting OperaFlow, please refer to our [Self-Hosting Guide](./docs/SELF-HOSTING.md).

The setup process includes:

- Setting up a Supabase project for database and authentication
- Configuring Redis for caching and session management
- Setting up Docker for secure agent execution
- Integrating with LLM providers (Anthropic, OpenAI, OpenRouter, etc.)
- Configuring web search and scraping capabilities (Tavily, Firecrawl)
- Setting up background job processing and workflows
- Configuring webhook handling for automated tasks
- Optional integrations (RapidAPI, custom data providers)

### Quick Start

1. **Clone the repository**:

```bash
git clone https://github.com/caioapfelbaum/OperaFlow.git
cd OperaFlow
```

2. **Run the setup wizard**:

```bash
python setup.py
```

The wizard will guide you through 14 steps with progress saving, so you can resume if interrupted.

3. **Start the platform**:

```bash
python start.py
```

### Manual Setup

See the [Self-Hosting Guide](./docs/SELF-HOSTING.md) for detailed manual setup instructions.

The wizard will guide you through all necessary steps to get your OperaFlow instance up and running. For detailed instructions, troubleshooting tips, and advanced configuration options, see the [Self-Hosting Guide](./docs/SELF-HOSTING.md).

## Contributing

We welcome contributions from the community! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/your-feature`)
3. **Commit your changes** (`git commit -am 'feat: add some feature'`)
4. **Push to the branch** (`git push origin feature/your-feature`)
5. **Open a Pull Request**

### Areas for Contribution

- **New Agent Tools**: Develop new capabilities for agents
- **MCP Integrations**: Create connectors for popular services
- **UI/UX Improvements**: Enhance the user interface and experience
- **Documentation**: Improve guides, tutorials, and API documentation
- **Performance Optimization**: Optimize system performance and scalability
- **Testing**: Add tests and improve test coverage

## Acknowledgements

### Core Technologies

- **[Supabase](https://supabase.com/)** - Database and authentication platform
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[Docker](https://docker.com/)** - Containerization and isolation
- **[Playwright](https://playwright.dev/)** - Browser automation
- **[Anthropic](https://anthropic.com/)** - Claude AI models
- **[OpenAI](https://openai.com/)** - GPT models and API

### Inspiration

This project builds upon the excellent work of the open-source AI community and incorporates learnings from various AI agent frameworks and platforms.

## License

OperaFlow is released under the [Apache 2.0 License](./LICENSE).

---

<div align="center">

**[Website](https://operaflow.com)** • **[Documentation](./docs/)** • **[Self-Hosting Guide](./docs/SELF-HOSTING.md)** • **[Contributing](./CONTRIBUTING.md)**

Made with ❤️ by the OperaFlow community

</div> 