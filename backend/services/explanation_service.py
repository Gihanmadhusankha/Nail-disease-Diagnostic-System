import re


def load_knowledge_base(path: str) -> str:
    with open(path, 'r', encoding='utf-8') as file:
        return file.read()


def _normalize_text(value: str) -> str:
   return re.sub(r"[^a-z0-9]+", "", value.lower())


def _split_blocks(knowledge_base_content: str) -> list[str]:
   return [
      block.strip()
      for block in re.split(r"\n\s*---\s*\n", knowledge_base_content)
      if block.strip() and "END OF KNOWLEDGE BASE" not in block
   ]


def _find_disease_block(knowledge_base_content: str, disease_name: str) -> str | None:
   disease_variants = {
      disease_name.lower(),
      disease_name.lower().replace('-', ' '),
      disease_name.lower().replace("'", ''),
   }
   disease_variants.update({_normalize_text(item) for item in disease_variants})

   for block in _split_blocks(knowledge_base_content):
      block_lower = block.lower()
      block_normalized = _normalize_text(block)
      if any(
         variant and (variant in block_lower or variant in block_normalized)
         for variant in disease_variants
      ):
         return block

   return None


def _extract_section(block: str, heading_aliases: list[str]) -> str:
   lines = block.splitlines()
   lower_aliases = {alias.lower() for alias in heading_aliases}
   all_headings = {
      'overview',
      'key symptoms',
      'common causes',
      'diagnosis',
      'treatment',
      'treatment options',
      'prevention',
      'prevention and self-care',
      'prognosis',
      'characteristics',
      'maintenance',
      'nutrition support',
   }

   capture = False
   captured_lines: list[str] = []
   for raw_line in lines:
      line = raw_line.strip()
      if not line:
         if capture:
            captured_lines.append(raw_line)
         continue

      heading_match = re.match(r"^([A-Za-z\-\s'’]+):\s*$", line)
      if heading_match:
         heading = heading_match.group(1).strip().lower()
         if heading in lower_aliases:
            capture = True
            continue
         if capture and heading in all_headings:
            break

      if capture:
         captured_lines.append(raw_line)

   return '\n'.join(line.rstrip() for line in captured_lines).strip()


def extract_structured_context(knowledge_base_content: str, disease_name: str) -> tuple[str, dict[str, str]]:
   block = _find_disease_block(knowledge_base_content, disease_name)
   if not block:
      return knowledge_base_content[:3000], {
         'overview': '',
         'key_symptoms': '',
         'common_causes': '',
         'diagnosis': '',
         'treatment_options': '',
         'prevention_self_care': '',
         'prognosis': '',
      }

   sections = {
      'overview': _extract_section(block, ['Overview']),
      'key_symptoms': _extract_section(block, ['Key Symptoms', 'Characteristics']),
      'common_causes': _extract_section(block, ['Common Causes']),
      'diagnosis': _extract_section(block, ['Diagnosis']),
      'treatment_options': _extract_section(block, ['Treatment Options', 'Treatment']),
      'prevention_self_care': _extract_section(block, ['Prevention and Self-Care', 'Prevention', 'Maintenance', 'Nutrition Support']),
      'prognosis': _extract_section(block, ['Prognosis']),
   }
   return block, sections


def extract_context(knowledge_base_content: str, disease_name: str) -> str:
   block, _ = extract_structured_context(knowledge_base_content, disease_name)
   return block


def build_prompt(disease_name: str, context: str, sections: dict[str, str]) -> str:
    return f"""You are a medical AI assistant specialised in nail and systemic diseases that manifest through nail changes.

Your task is to generate an accurate, patient-friendly explanation using ONLY the information provided in the medical knowledge base below.

MEDICAL KNOWLEDGE BASE:
{context}

Disease Name: {disease_name}

Instructions:
- Use clear, simple, non-alarming language.
- Do NOT introduce information that is not present in the knowledge base.
- Do NOT speculate or guess.
- Use bullet points where appropriate.
- Maintain medical accuracy.
- Include a short medical disclaimer at the end.
- Do NOT use markdown heading syntax like #, ##, ###, or ####.
- Use plain text section titles exactly as: "1. Overview", "2. Key Symptoms", etc.

Structured Section Data (parsed from knowledge base):
- Overview: {sections.get('overview') or '[NOT PROVIDED]'}
- Key Symptoms: {sections.get('key_symptoms') or '[NOT PROVIDED]'}
- Common Causes: {sections.get('common_causes') or '[NOT PROVIDED]'}
- Diagnosis: {sections.get('diagnosis') or '[NOT PROVIDED]'}
- Treatment Options: {sections.get('treatment_options') or '[NOT PROVIDED]'}
- Prevention and Self-Care: {sections.get('prevention_self_care') or '[NOT PROVIDED]'}
- Prognosis: {sections.get('prognosis') or '[NOT PROVIDED]'}

Please structure your response using the following sections:

1. Overview  
   Explain what the condition is in simple terms.

2. Key Symptoms  
   List the main visible signs and symptoms.

3. Common Causes  
   Explain the typical medical causes or risk factors.

4. Diagnosis  
   Describe how this condition is usually identified or confirmed.

5. Treatment Options  
   Summarise available treatments or management strategies.

6. Prevention and Self-Care  
   Provide practical advice to reduce risk or manage the condition.

7. Prognosis  
   Explain what patients can generally expect with proper care.

Special Rule:
- If the disease name is "Healthy Nail", provide positive reinforcement and guidance on maintaining nail health instead of medical treatment.
- If a section is provided in "Structured Section Data", you MUST use that section content and MUST NOT say "not available" for that section.
- Only say information is unavailable if that specific section is marked as [NOT PROVIDED].

Medical Disclaimer:
End the response with a disclaimer stating that this information is for educational purposes only and does not replace professional medical advice."""


def generate_explanation(llm, disease_name: str, knowledge_base_content: str) -> str:
   context, sections = extract_structured_context(knowledge_base_content, disease_name)
   prompt = build_prompt(disease_name, context, sections)

   response = llm.invoke(prompt)
   if isinstance(response, str):
        return response

   return getattr(response, 'content', '') or str(response)
