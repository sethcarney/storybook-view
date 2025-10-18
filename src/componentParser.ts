import * as fs from "fs";
import * as path from "path";

export interface PropInfo {
  type?: string;
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ComponentInfo {
  name: string;
  filePath: string;
  props: Record<string, PropInfo>;
  code: string;
}

export class ComponentParser {
  parseComponent(filePath: string): ComponentInfo {
    const code = fs.readFileSync(filePath, "utf-8");
    const componentName = this.extractComponentName(filePath, code);
    const props = this.extractProps(code);

    return {
      name: componentName,
      filePath,
      props,
      code
    };
  }

  private extractComponentName(filePath: string, code: string): string {
    // Try to extract from export default
    const defaultExportMatch = code.match(
      /export\s+default\s+(?:function\s+)?(\w+)/
    );
    if (defaultExportMatch) {
      return defaultExportMatch[1];
    }

    // Try to extract from function declaration
    const functionMatch = code.match(
      /(?:export\s+)?(?:const|function)\s+(\w+)\s*[=\(]/
    );
    if (functionMatch) {
      return functionMatch[1];
    }

    // Fall back to filename
    return path.basename(filePath, path.extname(filePath));
  }

  private extractProps(code: string): Record<string, PropInfo> {
    const props: Record<string, PropInfo> = {};

    // Look for TypeScript interface or type definitions
    const interfaceMatch = code.match(/interface\s+\w*Props\s*\{([^}]+)\}/);
    if (interfaceMatch) {
      const propsText = interfaceMatch[1];
      const propMatches = propsText.matchAll(/(\w+)(\?)?:\s*([^;,\n]+)/g);

      for (const match of propMatches) {
        const [, propName, optional, propType] = match;
        props[propName] = {
          type: propType.trim(),
          required: !optional
        };
      }
    }

    // Look for PropTypes (JavaScript)
    const propTypesMatch = code.match(/\.propTypes\s*=\s*\{([^}]+)\}/);
    if (propTypesMatch) {
      const propsText = propTypesMatch[1];
      const propMatches = propsText.matchAll(
        /(\w+):\s*PropTypes\.(\w+)(?:\.isRequired)?/g
      );

      for (const match of propMatches) {
        const [fullMatch, propName, propType] = match;
        props[propName] = {
          type: propType,
          required: fullMatch.includes(".isRequired")
        };
      }
    }

    // Look for default props
    const defaultPropsMatch = code.match(/\.defaultProps\s*=\s*\{([^}]+)\}/);
    if (defaultPropsMatch) {
      const defaultPropsText = defaultPropsMatch[1];
      const defaultMatches = defaultPropsText.matchAll(/(\w+):\s*([^,\n]+)/g);

      for (const match of defaultMatches) {
        const [, propName, defaultValue] = match;
        if (props[propName]) {
          props[propName].defaultValue = defaultValue.trim();
        }
      }
    }

    // If no props found, try to extract from destructuring
    if (Object.keys(props).length === 0) {
      const destructuringMatch = code.match(/\(\s*\{\s*([^}]+)\s*\}\s*\)/);
      if (destructuringMatch) {
        const propsText = destructuringMatch[1];
        const propNames = propsText
          .split(",")
          .map((p) => p.trim().split(/[=\s]/)[0]);

        propNames.forEach((propName) => {
          if (propName && propName !== "...") {
            props[propName] = { type: "any" };
          }
        });
      }
    }

    return props;
  }
}
