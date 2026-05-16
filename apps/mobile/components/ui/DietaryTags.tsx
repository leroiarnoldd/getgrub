import { View, StyleSheet } from 'react-native';
import { Badge } from './Badge';

const DIETARY_LABELS: Record<string, string> = {
  halal: 'Halal',
  vegan: 'Vegan',
  vegetarian: 'Veggie',
  'vegan-options': 'Vegan opts',
  'vegetarian-options': 'Veggie opts',
  'gluten-free': 'GF',
  'gluten-free-options': 'GF opts',
  'dairy-free': 'Dairy-free',
  'nut-free': 'Nut-free',
  kosher: 'Kosher',
};

interface Props {
  tags: string[];
  userDietaryTags?: string[];
}

export function DietaryTags({ tags, userDietaryTags = [] }: Props) {
  const relevantTags = userDietaryTags.length > 0
    ? tags.filter(t => userDietaryTags.some(ud => t.includes(ud.replace('-options', ''))))
    : tags.slice(0, 3);

  if (relevantTags.length === 0) return null;

  return (
    <View style={styles.row}>
      {relevantTags.map(tag => (
        <Badge key={tag} label={DIETARY_LABELS[tag] || tag} color="teal" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
