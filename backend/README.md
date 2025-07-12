https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.html

https://clintgoodman27.medium.com/a-practical-guide-for-using-autogen-in-software-applications-8799185d27ee

# Multi-Agent Academic Paper Discussion System

This project implements a sophisticated multi-agent system using AutoGen for discussing and analyzing academic papers. The system consists of three specialized agents that work together to provide comprehensive paper analysis and discussion.

## 🎯 Overview

The system features three distinct agent roles:

1. **User Proxy Agent**: Represents the human user and manages the conversation flow
2. **Explorer Agent**: Analyzes and explores the paper's content, methodology, and findings
3. **Reviewer Agent**: Provides critical evaluation, identifies strengths/weaknesses, and suggests improvements

## 🚀 Features

- **Structured Analysis**: Systematic examination of academic papers
- **Multi-Perspective Discussion**: Different viewpoints from specialized agents
- **Interactive Mode**: Support for custom paper input
- **Comprehensive Coverage**: Analysis of methodology, findings, strengths, and limitations
- **Collaborative Discussion**: Agents build on each other's insights

## 📋 Prerequisites

- Python 3.12 or higher
- OpenAI API key
- Required dependencies (see `pyproject.toml`)

## 🛠️ Installation

1. **Install dependencies**:

   ```bash
   cd backend
   pip install -e .
   ```

2. **Set up environment variables**:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   ```

## 🎮 Usage

### Basic Example

Run the example with a sample paper:

```bash
python example.py
```

### Interactive Mode

Run with your own paper content:

```bash
python example.py --interactive
```

### Programmatic Usage

```python
from example import discuss_paper

# Your paper content
paper_content = """
Title: Your Paper Title

Abstract:
Your paper abstract here...

Methodology:
Your methodology description...

Findings:
Your key findings...
"""

# Start the discussion
discuss_paper(paper_content, "Your Paper Title")
```

## 🤖 Agent Roles Explained

### User Proxy Agent

- **Purpose**: Represents the human user and facilitates the discussion
- **Responsibilities**:
  - Manages conversation flow
  - Asks clarifying questions
  - Ensures comprehensive coverage of topics
  - Coordinates between other agents

### Explorer Agent

- **Purpose**: Deep analysis of paper content and methodology
- **Responsibilities**:
  - Content analysis and explanation
  - Methodology review
  - Key findings summary
  - Technical detail explanation
  - Contextual understanding

### Reviewer Agent

- **Purpose**: Critical evaluation and constructive feedback
- **Responsibilities**:
  - Strengths identification
  - Weaknesses analysis
  - Methodology assessment
  - Literature review evaluation
  - Improvement suggestions

## 📊 Discussion Topics Covered

The system ensures comprehensive coverage of:

- **Research Methodology**: Design, data collection, analysis techniques
- **Key Findings**: Results, conclusions, contributions
- **Theoretical Framework**: Literature review, conceptual foundations
- **Strengths & Limitations**: Balanced evaluation
- **Practical Implications**: Real-world applications
- **Future Research**: Suggestions for further work

## ⚙️ Configuration

### Model Configuration

The system uses GPT-4 by default. You can modify the configuration in `example.py`:

```python
config_list = [
    {
        "model": "gpt-4",  # Change to your preferred model
        "api_key": os.getenv("OPENAI_API_KEY"),
    }
]
```

### Agent Parameters

Each agent has configurable parameters:

- **Temperature**: Controls creativity (0.0-1.0)
- **Max Consecutive Auto Reply**: Limits automatic responses
- **Human Input Mode**: Controls when human input is required

## 🔧 Customization

### Adding New Agent Types

To add new agent types, modify the `create_agents()` function:

```python
def create_agents():
    # ... existing agents ...

    # Add new agent
    new_agent = autogen.AssistantAgent(
        name="new_agent",
        system_message="Your system message here",
        llm_config={"config_list": config_list}
    )

    return {
        "user_proxy": user_proxy,
        "explorer": explorer,
        "reviewer": reviewer,
        "new_agent": new_agent  # Add to return dict
    }
```

### Modifying Discussion Flow

Adjust the `discuss_paper()` function to change the discussion structure:

```python
def discuss_paper(paper_content: str, paper_title: str = "Academic Paper"):
    # Customize the initial prompt
    initial_prompt = f"""
    Your custom discussion prompt here...
    """

    # Start the discussion
    agents["user_proxy"].initiate_chat(manager, message=initial_prompt)
```

## 📝 Example Output

The system produces structured discussions like:

```
MULTI-AGENT ACADEMIC PAPER DISCUSSION SYSTEM
================================================================================
Paper: The Impact of Machine Learning on Academic Research: A Systematic Review
================================================================================

user_proxy: Let's have a comprehensive discussion about the academic paper...

explorer: **Content Analysis**
This systematic review examines the transformative impact of machine learning...

reviewer: **Critical Evaluation**
Strengths:
- Comprehensive methodology using PRISMA guidelines
- Large sample size (150 papers)
- Clear thematic analysis approach

Weaknesses:
- Limited to English-language publications
- Potential publication bias
- Rapidly evolving field limitations

user_proxy: Excellent analysis from both perspectives. Let's explore the practical implications...
```

## 🚨 Troubleshooting

### Common Issues

1. **Import Error**: Ensure all dependencies are installed

   ```bash
   pip install -e .
   ```

2. **API Key Error**: Verify your OpenAI API key is set

   ```bash
   echo $OPENAI_API_KEY
   ```

3. **Model Access**: Ensure you have access to the specified model (GPT-4)

### Debug Mode

For debugging, set human input mode to "ALWAYS":

```python
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="ALWAYS",  # Change from "NEVER"
    # ... other config
)
```

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [AutoGen](https://github.com/microsoft/autogen)
- Powered by OpenAI's GPT models
- Inspired by collaborative academic review processes
