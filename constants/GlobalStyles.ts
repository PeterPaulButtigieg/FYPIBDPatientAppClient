import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // Container utilities
  root: { flex: 1, position: 'relative' },
  scroll: { flex: 1 },
  container: { marginTop: 30, padding: 16 },

  // Card common
  Card: { 
    marginBottom: 16, 
    borderRadius: 12, 
    elevation: 4 
},

  CardTitle: { 
    fontSize: 22, 
    fontWeight: '600', 
    marginBottom: 12 
},

  Divider: { 
    marginBottom: 16, 
    borderWidth: 0.75, 
    borderColor: 'gray' 
},

  CardItem: {
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
},

  CardItemRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
},

  CardText: { 
    flex: 1, 
    paddingRight: 8 
},

  CardItemName: { 
    fontSize: 16, 
    fontWeight: '600' 
},

  CardItemDesc: { 
    fontSize: 12, 
    marginTop: 4 
},

  // Icon styling
  Icon: { 
    margin: 0 
},

  IconRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
},

  // Info row
  InfoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12 
},

  InfoText: { 
    fontSize: 12 
},

  infoLine: { 
    fontSize: 14, 
    marginBottom: 4 
},

  // Hydration chart block
  hydrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  hydChartContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },

  AttentionText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 50,
  },  
});
